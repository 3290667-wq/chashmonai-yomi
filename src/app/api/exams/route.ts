import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List active exams for users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active exams with question count
    const exams = await prisma.exam.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        pointsReward: true,
        _count: {
          select: { questions: true },
        },
      },
    });

    // Get user's attempts
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: session.user.id },
      select: {
        examId: true,
        score: true,
        totalQuestions: true,
        pointsEarned: true,
        completedAt: true,
      },
      orderBy: { completedAt: "desc" },
    });

    // Create a map of best attempts per exam
    const attemptMap = new Map<string, {
      score: number;
      totalQuestions: number;
      pointsEarned: number;
      completedAt: Date;
      attemptCount: number;
    }>();

    for (const attempt of attempts) {
      const existing = attemptMap.get(attempt.examId);
      if (!existing) {
        attemptMap.set(attempt.examId, {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          pointsEarned: attempt.pointsEarned,
          completedAt: attempt.completedAt,
          attemptCount: 1,
        });
      } else {
        existing.attemptCount++;
        // Keep the best score
        if (attempt.score > existing.score) {
          existing.score = attempt.score;
          existing.pointsEarned = attempt.pointsEarned;
        }
      }
    }

    const examsWithAttempts = exams.map((exam) => ({
      ...exam,
      questionsCount: exam._count.questions,
      userAttempt: attemptMap.get(exam.id) || null,
    }));

    return NextResponse.json({ exams: examsWithAttempts });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// POST - Submit exam answers
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { examId, answers } = body;

    if (!examId || !answers) {
      return NextResponse.json(
        { error: "Missing examId or answers" },
        { status: 400 }
      );
    }

    // Get exam with questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId, isActive: true },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "מבחן לא נמצא או לא פעיל" },
        { status: 404 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const results: { questionId: string; correct: boolean; userAnswer: string; correctAnswer: string }[] = [];

    for (const question of exam.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      results.push({
        questionId: question.id,
        correct: isCorrect,
        userAnswer: userAnswer || "",
        correctAnswer: question.correctAnswer,
      });
    }

    const totalQuestions = exam.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Calculate points - full points only if all correct, otherwise proportional
    let pointsEarned = 0;
    if (correctCount === totalQuestions) {
      pointsEarned = exam.pointsReward;
    } else if (correctCount > 0) {
      pointsEarned = Math.round((correctCount / totalQuestions) * exam.pointsReward * 0.5);
    }

    // Save attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        userId: session.user.id,
        score: correctCount,
        totalQuestions,
        pointsEarned,
        answers: JSON.stringify(answers),
      },
    });

    // Add points to user
    if (pointsEarned > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: pointsEarned },
        },
      });
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score: correctCount,
        totalQuestions,
        percentage,
        pointsEarned,
      },
      results,
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}

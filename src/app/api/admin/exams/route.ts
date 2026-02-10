import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all exams (admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// POST - Create new exam
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, pointsReward, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "חסרים שדות חובה (כותרת ושאלות)" },
        { status: 400 }
      );
    }

    // Validate questions
    for (const q of questions) {
      if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
        return NextResponse.json(
          { error: "כל שאלה חייבת להכיל טקסט, 4 תשובות, ותשובה נכונה" },
          { status: 400 }
        );
      }
      if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
        return NextResponse.json(
          { error: "תשובה נכונה חייבת להיות A, B, C או D" },
          { status: 400 }
        );
      }
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description: description || null,
        pointsReward: pointsReward || 10,
        createdById: session.user.id,
        questions: {
          create: questions.map((q: {
            questionText: string;
            optionA: string;
            optionB: string;
            optionC: string;
            optionD: string;
            correctAnswer: string;
          }, index: number) => ({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            order: index,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ exam, success: true });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

// PATCH - Update exam
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "RAM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, pointsReward, isActive, questions } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    // Update exam
    const updateData: {
      title?: string;
      description?: string | null;
      pointsReward?: number;
      isActive?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pointsReward !== undefined) updateData.pointsReward = pointsReward;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If questions are provided, delete existing and create new
    if (questions && Array.isArray(questions)) {
      await prisma.examQuestion.deleteMany({
        where: { examId: id },
      });

      await prisma.examQuestion.createMany({
        data: questions.map((q: {
          questionText: string;
          optionA: string;
          optionB: string;
          optionC: string;
          optionD: string;
          correctAnswer: string;
        }, index: number) => ({
          examId: id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          order: index,
        })),
      });
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ exam, success: true });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

// DELETE - Delete exam
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get exam questions for taking the exam
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id, isActive: true },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            // Note: NOT including correctAnswer - we don't want to expose it
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "מבחן לא נמצא או לא פעיל" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        pointsReward: exam.pointsReward,
        questions: exam.questions,
      },
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

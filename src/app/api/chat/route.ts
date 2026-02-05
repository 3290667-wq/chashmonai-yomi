import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch messages for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const recipientId = searchParams.get("recipientId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const cursor = searchParams.get("cursor");

    // If user is RAM/ADMIN, they can see messages from their soldiers
    // If user is regular USER, they can only see their own conversations
    const userId = session.user.id;

    let whereClause;

    if (recipientId) {
      // Get conversation with specific user
      whereClause = {
        OR: [
          { fromUserId: userId, toUserId: recipientId },
          { fromUserId: recipientId, toUserId: userId },
        ],
      };
    } else {
      // Get all conversations for this user
      whereClause = {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        fromUser: {
          select: { id: true, name: true, image: true, role: true },
        },
        toUser: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    // Mark messages as read if they're sent TO the current user
    if (recipientId) {
      await prisma.chatMessage.updateMany({
        where: {
          fromUserId: recipientId,
          toUserId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { toUserId, message } = body;

    if (!toUserId || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, role: true, platoon: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Create the message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        message: message.trim(),
      },
      include: {
        fromUser: {
          select: { id: true, name: true, image: true, role: true },
        },
        toUser: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json({ message: chatMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

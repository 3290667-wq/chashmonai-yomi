import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch available contacts for chat
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, platoon: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let contacts;

    if (currentUser.role === "USER") {
      // Regular users can only contact RAMs from their platoon
      contacts = await prisma.user.findMany({
        where: {
          role: "RAM",
          ...(currentUser.platoon && { platoon: currentUser.platoon }),
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          platoon: true,
        },
      });

      // If no RAM found for platoon, show all RAMs
      if (contacts.length === 0) {
        contacts = await prisma.user.findMany({
          where: { role: "RAM" },
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            platoon: true,
          },
        });
      }
    } else if (currentUser.role === "RAM") {
      // RAMs can contact users from their platoon and other RAMs/admins
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            { platoon: currentUser.platoon, role: "USER" },
            { role: { in: ["RAM", "ADMIN"] } },
          ],
          NOT: { id: session.user.id },
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          platoon: true,
        },
      });
    } else {
      // Admins can contact everyone
      contacts = await prisma.user.findMany({
        where: {
          NOT: { id: session.user.id },
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          platoon: true,
        },
      });
    }

    // Get last message and unread count for each contact
    const contactsWithMeta = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            OR: [
              { fromUserId: session.user.id, toUserId: contact.id },
              { fromUserId: contact.id, toUserId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: {
            message: true,
            createdAt: true,
            fromUserId: true,
          },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: {
            fromUserId: contact.id,
            toUserId: session.user.id,
            isRead: false,
          },
        });

        return {
          ...contact,
          lastMessage: lastMessage
            ? {
                text:
                  lastMessage.message.length > 50
                    ? lastMessage.message.substring(0, 50) + "..."
                    : lastMessage.message,
                timestamp: lastMessage.createdAt,
                isFromMe: lastMessage.fromUserId === session.user.id,
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sort by last message time (most recent first)
    contactsWithMeta.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.timestamp).getTime() -
        new Date(a.lastMessage.timestamp).getTime()
      );
    });

    return NextResponse.json({ contacts: contactsWithMeta });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

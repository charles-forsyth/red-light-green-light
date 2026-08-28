import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userHandle = searchParams.get("userHandle");

    if (!userHandle) {
      return NextResponse.json({ error: "userHandle required" }, { status: 400 });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { sender: { handle: { equals: userHandle, mode: "insensitive" } } },
          { receiver: { handle: { equals: userHandle, mode: "insensitive" } } },
        ],
      },
      include: {
        sender: { select: { handle: true } },
        receiver: { select: { handle: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      senderHandle: m.sender.handle,
      receiverHandle: m.receiver.handle,
      content: m.content,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, messages: formatted });
  } catch (error: any) {
    console.error("Messages GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderHandle, receiverHandle, content } = body;

    const sender = await prisma.user.findFirst({
      where: { handle: { equals: senderHandle, mode: "insensitive" } },
    });
    const receiver = await prisma.user.findFirst({
      where: { handle: { equals: receiverHandle, mode: "insensitive" } },
    });

    if (!sender || !receiver) {
      return NextResponse.json({ error: "Sender or Receiver not found" }, { status: 404 });
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content,
      },
      include: {
        sender: { select: { handle: true } },
        receiver: { select: { handle: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderHandle: message.sender.handle,
        receiverHandle: message.receiver.handle,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Messages POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

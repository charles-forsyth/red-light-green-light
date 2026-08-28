import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      handle: u.handle,
      email: u.email,
      role: u.role,
      subscriptionActive: u.subscriptionActive,
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, role, subscriptionActive } = body;

    if (action === "toggleSub") {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { subscriptionActive },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === "delete") {
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

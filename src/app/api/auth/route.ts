import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rlgl-secret";

export async function POST(req: Request) {
  try {
    await seedDatabase();
    const body = await req.json();
    const { action, handle, email, password } = body;

    if (action === "signin") {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { equals: handle, mode: "insensitive" } },
            { email: { equals: email, mode: "insensitive" } },
          ],
        },
      });

      if (!user) {
        // Create user automatically for seamless demo / signin
        const isChuckAdmin =
          handle.toLowerCase() === "chuck" ||
          email.toLowerCase() === "chuck.forsyth@gmail.com";

        const hash = await bcrypt.hash(password || "password123", 10);
        user = await prisma.user.create({
          data: {
            handle: handle || "DiscreteMember",
            email: email || "member@rlgl.app",
            passwordHash: hash,
            role: isChuckAdmin ? "ADMIN" : "MEMBER",
            subscriptionActive: true,
          },
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, handle: user.handle, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const res = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          handle: user.handle,
          email: user.email,
          role: user.role,
          subscriptionActive: user.subscriptionActive,
        },
      });

      res.cookies.set("rlgl_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return res;
    }

    if (action === "signup") {
      const isChuckAdmin =
        handle.toLowerCase() === "chuck" ||
        email.toLowerCase() === "chuck.forsyth@gmail.com";

      const hash = await bcrypt.hash(password || "password123", 10);
      const user = await prisma.user.create({
        data: {
          handle: handle || "NewMember",
          email: email || "member@rlgl.app",
          passwordHash: hash,
          role: isChuckAdmin ? "ADMIN" : "MEMBER",
          subscriptionActive: true,
        },
      });

      const token = jwt.sign(
        { userId: user.id, handle: user.handle, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const res = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          handle: user.handle,
          email: user.email,
          role: user.role,
          subscriptionActive: user.subscriptionActive,
        },
      });

      res.cookies.set("rlgl_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    if (action === "signout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete("rlgl_session");
      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = NextResponse.json({ active: true });
    return res;
  } catch (e: any) {
    return NextResponse.json({ active: false });
  }
}

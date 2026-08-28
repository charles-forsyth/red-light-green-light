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

    // --- STRICT SIGN IN (Must exist in DB and password must match) ---
    if (action === "signin") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email/Handle and password are required." },
          { status: 400 }
        );
      }

      // Search DB for user
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { equals: handle || "", mode: "insensitive" } },
            { email: { equals: email || "", mode: "insensitive" } },
          ],
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials. User account not found. Please register first." },
          { status: 401 }
        );
      }

      // Verify Password Hash
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return NextResponse.json(
          { error: "Invalid credentials. Password incorrect." },
          { status: 401 }
        );
      }

      // Issue JWT Session Cookie
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

    // --- STRICT SIGN UP (Creates new record with hashed password) ---
    if (action === "signup") {
      if (!handle || !email || !password) {
        return NextResponse.json(
          { error: "Handle, email, and password are required to register." },
          { status: 400 }
        );
      }

      // Check for existing user
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { equals: handle, mode: "insensitive" } },
            { email: { equals: email, mode: "insensitive" } },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Account handle or email already registered. Please sign in instead." },
          { status: 400 }
        );
      }

      const isChuckAdmin =
        handle.toLowerCase() === "chuck" ||
        email.toLowerCase() === "chuck.forsyth@gmail.com";

      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          handle,
          email,
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

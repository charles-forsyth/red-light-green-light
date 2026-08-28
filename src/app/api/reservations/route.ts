import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: Request) {
  try {
    await seedDatabase();
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get("venueId");

    // AUTO-EXPIRE PAST TIMESLOTS IN POSTGRESQL
    const now = new Date();
    await prisma.boothReservation.deleteMany({
      where: {
        endTime: { lt: now },
      },
    });

    // If venueId is provided, query that venue; otherwise query ALL active reservations across all venues!
    const whereClause = venueId ? { venueId } : {};

    const reservations = await prisma.boothReservation.findMany({
      where: whereClause,
      include: {
        user: { select: { handle: true } },
        venue: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = reservations.map((r) => ({
      id: r.id,
      userId: r.userId,
      userHandle: r.user.handle,
      venueId: r.venueId,
      venueName: r.venue.name,
      boothNumber: r.boothNumber || undefined,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      status: r.status,
      preference: r.preference,
      note: r.note || undefined,
    }));

    return NextResponse.json({ success: true, reservations: formatted });
  } catch (error: any) {
    console.error("Reservations GET API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, venueId, boothNumber, startTime, endTime, preference, note } = body;

    const reservation = await prisma.boothReservation.create({
      data: {
        userId,
        venueId,
        boothNumber: boothNumber ? Number(boothNumber) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "GREEN_LIGHT",
        preference: preference || "HANGOUT",
        note: note || null,
      },
      include: {
        user: { select: { handle: true } },
        venue: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        userId: reservation.userId,
        userHandle: reservation.user.handle,
        venueId: reservation.venueId,
        venueName: reservation.venue.name,
        boothNumber: reservation.boothNumber || undefined,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
        status: reservation.status,
        preference: reservation.preference,
        note: reservation.note || undefined,
      },
    });
  } catch (error: any) {
    console.error("Reservations POST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

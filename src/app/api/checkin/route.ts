import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, venueId, boothNumber, preference, note, reservationId } = body;

    // --- INSTANT CHECK IN NOW ---
    if (action === "checkin") {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1-hour window

      const reservation = await prisma.boothReservation.create({
        data: {
          userId,
          venueId,
          boothNumber: boothNumber ? Number(boothNumber) : null,
          startTime: now,
          endTime: oneHourLater,
          status: "GREEN_LIGHT",
          preference: preference || "HANGOUT",
          note: note || "Checked in on-site right now.",
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
    }

    // --- INSTANT CHECK OUT NOW ---
    if (action === "checkout") {
      if (reservationId) {
        await prisma.boothReservation.delete({
          where: { id: reservationId },
        });
      } else if (userId) {
        // Delete all active reservations for this user
        await prisma.boothReservation.deleteMany({
          where: { userId },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Checkin/Checkout API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

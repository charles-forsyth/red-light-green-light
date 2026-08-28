import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  // 1. Seed Venues
  const venueCount = await prisma.venue.count();
  if (venueCount === 0) {
    await prisma.venue.createMany({
      data: [
        {
          id: "venue-lawrenceville",
          name: "Adult World - Lawrenceville",
          address: "US-15 & PA-49, Lawrenceville, PA 16929",
          latitude: 41.9984,
          longitude: -77.1262,
          boothCount: 12,
        },
        {
          id: "venue-paintedpost",
          name: "Adult World - Painted Post",
          address: "Addison Rd, Painted Post, NY 14870",
          latitude: 42.1623,
          longitude: -77.0984,
          boothCount: 16,
        },
        {
          id: "venue-elmira",
          name: "Adult World - Elmira",
          address: "Lake Rd, Horseheads/Elmira, NY 14903",
          latitude: 42.1485,
          longitude: -76.8123,
          boothCount: 10,
        },
        {
          id: "venue-binghamton",
          name: "Adult World - Binghamton",
          address: "Front St, Binghamton, NY 13905",
          latitude: 42.1321,
          longitude: -75.9123,
          boothCount: 14,
        },
      ],
    });
    console.log("🟢 Venues Seeded into PostgreSQL!");
  }

  // 2. Seed Sole Admin Chuck
  const adminUser = await prisma.user.findUnique({
    where: { email: "chuck.forsyth@gmail.com" },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        id: "user-admin-chuck",
        handle: "chuck",
        email: "chuck.forsyth@gmail.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        subscriptionActive: true,
      },
    });
    console.log("🟢 Sole Admin Chuck Seeded into PostgreSQL!");
  }
}

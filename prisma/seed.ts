import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pool of sample names
const guestNames = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan",
  "Fiona", "George", "Hannah", "Ian", "Julia",
  "Kevin", "Laura", "Mike", "Nina", "Oscar",
  "Paula", "Quinn", "Ryan", "Sophia", "Tom"
];

async function main() {
  console.log("🌱 Starting seed...");

  const roomsData = [
    { name: "Single Room", description: "Cozy single room", price: 2000 },
    { name: "Double Room", description: "Comfortable double room", price: 3500 },
    { name: "Family Room", description: "Room for 4 people", price: 5000 },
    { name: "Suite", description: "Luxurious suite", price: 8000 },
    { name: "Presidential Suite", description: "Top-tier luxury", price: 15000 },
  ];

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  // Create rooms
  await prisma.room.createMany({
    data: roomsData,
    skipDuplicates: true,
  });

  const createdRooms = await prisma.room.findMany();
  const last14Days = getLastNDates(14);

  const allBookings: any[] = [];

  createdRooms.forEach(room => {
    last14Days.forEach(date => {
      const dailyBookings = randomInt(2, 5); // 2-5 bookings per day
      for (let i = 0; i < dailyBookings; i++) {
        const guestName = guestNames[Math.floor(Math.random() * guestNames.length)];
        allBookings.push({
          roomId: room.id,
          guestName,
          guestEmail: `${guestName.toLowerCase()}@example.com`,
          createdAt: new Date(date)
        });
      }
    });
  });

  await prisma.booking.createMany({
    data: allBookings,
    skipDuplicates: true,
  });

  console.log("✅ Seed completed with real guest names!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

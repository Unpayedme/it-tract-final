import { prisma } from "@/lib/prisma";

// ----------  shared cache object  ----------
export let analyticsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60000;

export async function GET() {
  try {
    if (analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_DURATION) {
      return Response.json(analyticsCache.data);
    }

    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          select: { createdAt: true, guestName: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    const analytics = rooms.map((room) => {
      const bookingCountsByDate: Record<string, number> = {};
      room.bookings.forEach((b) => {
        const date = new Date(b.createdAt).toISOString().split("T")[0];
        bookingCountsByDate[date] = (bookingCountsByDate[date] || 0) + 1;
      });

      const bookingsOverTime = Object.entries(bookingCountsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const guestRecords = room.bookings
        .map((b) => ({
          guestName: b.guestName || "Guest",
          date: new Date(b.createdAt).toISOString().split("T")[0],
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return { roomId: room.id, name: room.name, price: room.price, bookingsOverTime, guestRecords };
    });

    analyticsCache = { data: { analytics }, timestamp: Date.now() };
    return Response.json({ analytics });
  } catch (error) {
    return Response.json({ error: "Failed to fetch analytics", analytics: [] }, { status: 500 });
  }
}

// ... existing code ...
export const analyticsRoute = { analyticsCache };
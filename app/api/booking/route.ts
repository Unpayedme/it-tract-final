import { prisma } from "@/lib/prisma";

// ---- import the cache object ----
import { analyticsRoute } from "../analytics/route";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, guestName, guestEmail } = body ?? {};

    if (!roomId || !guestName || !guestEmail) {
      return Response.json(
        { error: "Missing roomId, guestName, or guestEmail" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        roomId: Number(roomId),
        guestName: String(guestName),
        guestEmail: String(guestEmail),
      },
      select: {
        id: true,
        roomId: true,
        guestName: true,
        guestEmail: true,
        createdAt: true,
      },
    });

    analyticsRoute.analyticsCache = null; // clear cache
    return Response.json({ booking });

  } catch (error) {
    console.error("BOOKING ERROR:", error);
    return Response.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

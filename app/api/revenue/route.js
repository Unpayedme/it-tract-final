import prisma from '@/lib/prisma';

// Returns a revenue series derived directly from the Member table
export async function GET() {
  try {
    const members = await prisma.member.findMany({ orderBy: { member_id: 'asc' } });

    // Build a series: one point per member (period = index+1, revenue = monthly_fee)
    const series = members.map((m, idx) => ({ period: idx + 1, revenue: Math.round(Number(m.monthly_fee) || 0) }));

    const totalRevenue = series.reduce((acc, p) => acc + (p.revenue || 0), 0);

    return new Response(JSON.stringify({ series, totalRevenue, memberCount: members.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch revenue' }), { status: 500 });
  }
}

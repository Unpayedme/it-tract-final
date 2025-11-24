import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { member_id: "desc" }
    });

    return Response.json(members, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const newMember = await prisma.member.create({
      data: {
        member_name: body.member_name,
        membership_type: body.membership_type,
        attendance_days: Number(body.attendance_days),
        trainer_assigned: body.trainer_assigned,
        monthly_fee: Number(body.monthly_fee)
      }
    });

    return Response.json(newMember, { status: 201 });
  } catch (err) {
    return Response.json({ error: "Failed to create member" }, { status: 500 });
  }
}

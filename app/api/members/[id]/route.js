import prisma from '@/lib/prisma';

export async function PUT(req, context) {
  const params = await context.params;
  const id = Number(params?.id);

  if (!id) {
    return new Response(JSON.stringify({ error: 'No ID provided' }), { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await prisma.member.update({
      where: { member_id: id },
      data: body,
    });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, context) {
  const params = await context.params;
  const id = Number(params?.id);

  if (!id) {
    return new Response(JSON.stringify({ error: 'No ID provided' }), { status: 400 });
  }

  try {
    const deleted = await prisma.member.delete({
      where: { member_id: id },
    });
    return new Response(JSON.stringify(deleted), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

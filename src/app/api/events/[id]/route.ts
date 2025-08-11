import { apiBack } from '@/lib/apiBack';

export async function PUT(req: Request, context: { params: { id: string } }) {
  const body = await req.json();
  const { id } = await context.params;
  try {
    const data = await apiBack('modifyEvent', 'PUT', { ...body, id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const data = await apiBack('deleteEvent', 'DELETE', { id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}
import { apiBack } from '@/lib/apiBack';
import { getStatusFromError } from '@/utils/apiUtils';

export async function PUT(req: Request, context: { params: any }) {
  const body = await req.json();
  const { id } = context.params;
  try {
    const data = await apiBack('modifyEvent', 'PUT', { ...body, id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request, context: { params: any }) {
  const { id } = context.params;
  try {
    const data = await apiBack('deleteEvent', 'DELETE', { id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
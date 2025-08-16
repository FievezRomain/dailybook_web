import { apiBack } from '@/lib/apiBack';

export async function PUT(req: Request, context: { params: { id: string } }) {
  const body = await req.json();
  const { id } = await context.params;
  try {
    const data = await apiBack('modifyEvent', 'PUT', { ...body, id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const data = await apiBack('deleteEvent', 'DELETE', { id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

function getStatusFromError(error: any) {
  if (error.status) return error.status;
  if (error.code === "UNAUTHORIZED" || error.message?.toLowerCase().includes("unauthorized")) return 401;
  if (error.code === "NOT_FOUND" || error.message?.toLowerCase().includes("not found")) return 404;
  if (error.code === "BAD_REQUEST" || error.message?.toLowerCase().includes("invalid")) return 400;
  return 500;
}
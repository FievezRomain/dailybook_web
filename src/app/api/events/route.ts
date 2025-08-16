import { apiBack } from '@/lib/apiBack';

export async function GET() {
  try {
    const data = await apiBack('eventsByUser', 'GET');
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('createEvent', 'POST', body);
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

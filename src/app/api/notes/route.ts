import { apiBack } from '@/lib/apiBack';

export async function GET() {
  try {
    const data = await apiBack('notesByUser', 'GET');
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('notesByUser', 'POST', body);
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('xxxByUser', 'PUT', body);
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('xxxByUser', 'DELETE', body);
    return Response.json(data);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}
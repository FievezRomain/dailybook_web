import { apiBack } from '@/lib/apiBack';
import { getStatusFromError } from '@/utils/apiUtils';

export async function GET() {
  try {
    const data = await apiBack('equideByUser', 'GET');
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('createEquide', 'POST', body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('modifyEquide', 'PUT', body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('deleteEquide', 'DELETE', body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

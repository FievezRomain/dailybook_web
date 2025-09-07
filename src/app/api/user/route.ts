import { apiBack } from "@/lib/apiBack";
import { getStatusFromError } from "@/utils/apiUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await apiBack('login', 'POST', body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function GET() {
  try {
    const data = await apiBack('user', 'GET');
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
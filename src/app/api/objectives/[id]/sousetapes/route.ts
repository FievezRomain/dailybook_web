import { apiBack } from "@/lib/apiBack";
import { getStatusFromError } from "@/utils/apiUtils";

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('modifySubTasks', 'PUT', body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
import { apiBack } from "@/lib/apiBack";
import { getStatusFromError } from "@/utils/apiUtils";

export async function GET() {
  try {
    const data = await apiBack('bodyPictures', 'GET');
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const data = await apiBack('deleteEquide', 'DELETE', { id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
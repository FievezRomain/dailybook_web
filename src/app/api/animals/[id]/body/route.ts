import { apiBack } from "@/lib/apiBack";
import { getStatusFromError } from "@/utils/apiUtils";

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const data = await apiBack('bodyPictures', 'GET', { idanimal: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await apiBack('addBodyPicture', 'POST', body );
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const data = await apiBack('deleteBodyPicture', 'DELETE', { id: Number(id) });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
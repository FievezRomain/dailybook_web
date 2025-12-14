import { apiBack } from "@/lib/apiBack";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    // Génère une presigned URL d'upload
    const data = await apiBack("file/upload-url", "POST", body);
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");
  const ressourceType = searchParams.get("ressourceType");
  const ressourceId = searchParams.get("ressourceId");
  if (!fileName) return new Response("Missing fileName", { status: 400 });
  if (!ressourceType) return new Response("Missing ressourceType", { status: 400 });
  if (!ressourceId) return new Response("Missing ressourceId", { status: 400 });

  try {
    // Génère une presigned URL de téléchargement/visualisation
    const data = await apiBack("file/download-url", "POST", { fileName, ressourceType, ressourceId });
    return Response.json(data);
  } catch (error: any) {
    const status = getStatusFromError(error);
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");
  if (!fileName) return new Response("Missing fileName", { status: 400 });

  try {
    // Supprime le fichier sur le backend
    await apiBack("file/delete", "POST", { fileName });
    return new Response(null, { status: 204 });
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
import apiClient from "@/lib/apiClient";

/**
 * Demande une presigned URL à l'API Next.js (proxy sécurisé)
 * @param filename Nom du fichier à uploader
 * @param contentType Type de contenu du fichier (par exemple, "image/png", "application/pdf", etc.)
 * @param ressourceType Type de ressource (par exemple, "image", "document", etc.)
 * @returns URL pré-signée pour l'upload du fichier
 */
export async function getPresignedUrl(filename: string, contentType: string, ressourceType: string): Promise<string> {
  const res = await apiClient.post("/storage", { filename, contentType, ressourceType });
  return res.data.url;
}

/**
 * Demande une presigned URL pour télécharger/visualiser un fichier depuis le système de stockage
 * @param fileName Nom du fichier à télécharger
 * @param ressourceType Type de ressource (par exemple, "image", "document", etc.)
 * @param ressourceId ID de la ressource associée (par exemple, l'ID d'un événement)
 * @returns URL pré-signée pour le téléchargement du fichier
 */
export async function getPresignedGetUrl(fileName: string, ressourceType: string, ressourceId: number): Promise<string> {
  const res = await apiClient.get(`/storage?fileName=${encodeURIComponent(fileName)}&ressourceType=${ressourceType}&ressourceId=${ressourceId}`);
  return res.data.url;
}

/**
 * Upload le fichier sur le système de stockage via la presigned URL
 * @param file Fichier à uploader
 * @param presignedUrl URL pré-signée pour l'upload
 */
export async function uploadToStorage(file: File, presignedUrl: string): Promise<void> {
  const upload = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("Erreur lors de l'upload sur le système de stockage");
}

/**
 * Supprime un fichier du système de stockage
 * @param fileName Nom du fichier à supprimer
 * @param ressourceType Type de ressource (par exemple, "image", "document", etc.)
 * @param ressourceId ID de la ressource associée (par exemple, l'ID d'un événement)
 */
export async function deleteFromStorage(fileName: string, ressourceType: string, ressourceId: number) {
  await apiClient.delete(`/storage?fileName=${encodeURIComponent(fileName)}&ressourceType=${ressourceType}&ressourceId=${ressourceId}`);
}
export function getStatusFromError(error: any): number {
  if (error.status) return error.status;
  if (error.code === "UNAUTHORIZED" || error.message?.toLowerCase().includes("unauthorized")) return 401;
  if (error.code === "NOT_FOUND" || error.message?.toLowerCase().includes("not found")) return 404;
  if (error.code === "BAD_REQUEST" || error.message?.toLowerCase().includes("invalid")) return 400;
  return 500;
}
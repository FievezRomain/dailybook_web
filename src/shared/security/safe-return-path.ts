export function safeReturnPath(returnTo: string | null): string {
  return returnTo && /^\/(?![\\/])/.test(returnTo) && !/[\r\n]/.test(returnTo) ? returnTo : '/dashboard';
}

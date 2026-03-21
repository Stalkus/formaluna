/** One-line preview for trade cards from structured specs JSON */
export function specsPreview(specs: unknown, maxPairs = 3): string {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return '';
  const entries = Object.entries(specs as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && String(v).trim() !== '',
  );
  return entries
    .slice(0, maxPairs)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(' | ');
}

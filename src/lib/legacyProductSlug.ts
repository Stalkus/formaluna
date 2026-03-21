export function parseLegacyStudioSlug(slug: string | undefined): number | null {
  const m = slug?.match(/^legacy-studio-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export function parseLegacyTradeSlug(slug: string | undefined): number | null {
  const m = slug?.match(/^legacy-trade-(\d+)$/);
  return m ? Number(m[1]) : null;
}

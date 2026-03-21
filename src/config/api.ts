/** Base URL without trailing slash. In Vite dev, empty string uses the dev-server proxy to the API. */
const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim().replace(/\/$/, '') ?? '';

if (import.meta.env.PROD && !rawBase && import.meta.env.VITE_DEPLOY_VERCEL !== 'true') {
  // eslint-disable-next-line no-console
  console.warn(
    '[Formaluna] VITE_API_BASE is not set. Set it in Vercel (Production) to your API origin, e.g. https://api.example.com — see VERCEL.md',
  );
}

export const API_BASE = rawBase || (import.meta.env.DEV ? '' : '');

/** False only when production build has no API URL and is not a Vercel fullstack deploy. */
export const isApiBaseConfigured =
  Boolean(rawBase) ||
  import.meta.env.DEV ||
  import.meta.env.VITE_DEPLOY_VERCEL === 'true';

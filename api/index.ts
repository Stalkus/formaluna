/**
 * Vercel serverless entry: same deployment as the Vite app.
 * Rewrites in vercel.json send /api/* and /health here.
 */
import app from '../backend/dist/app.js';

export default app;

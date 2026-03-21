import { env } from './lib/env.js';
import app from './app.js';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

export default app;

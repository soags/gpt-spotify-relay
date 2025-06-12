// src/common/createRelayRouter.ts

import express from 'express';

type QueryParser<T> = (q: any) => T;
type Handler<T> = (parsed: T, req: express.Request, res: express.Response) => Promise<void>;

export function createRelayRouter<T>(
  parseQuery: QueryParser<T>,
  handler: Handler<T>
): express.Router {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const raw = req.query.q;
      if (!raw) return res.status(400).json({ error: "'q' parameter is required" });

      const parsed = parseQuery(JSON.parse(raw as string));
      await handler(parsed, req, res);
    } catch (err) {
      res.status(500).json({ error: 'Internal error', detail: err instanceof Error ? err.message : String(err) });
    }
  });

  return router;
}
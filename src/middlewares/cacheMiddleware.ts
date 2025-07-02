import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';

export async function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET') return next();
  let key = req.originalUrl;
  // Clé personnalisée pour les offres sauvegardées d'un lycéen (avec /api)
  if (req.originalUrl.startsWith('/api/lyceen/offres/sauvegardees') && (req as any).user?.id) {
    key = `/api/lyceen/offres/sauvegardees/${(req as any).user.id}`;
  }
  // console.log('CACHE KEY:', key);
  const cached = await cache.get(key);
  if (cached) {
    return res.json(cached);
  }
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    cache.set(key, body, 60);
    return originalJson(body);
  };
  next();
} 
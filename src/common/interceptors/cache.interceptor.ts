import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Service de cache simple en mémoire
 * Peut être remplacé par Redis en production
 */
@Injectable()
export class CacheService {
  private readonly cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly logger = new Logger(CacheService.name);

  /**
   * Récupérer une valeur du cache
   */
  get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Vérifier si le cache a expiré
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`🗑️  Cache expiré: ${key}`);
      return null;
    }

    this.logger.debug(`✅ Cache hit: ${key}`);
    return cached.data;
  }

  /**
   * Stocker une valeur dans le cache
   */
  set(key: string, data: any, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
    this.logger.debug(`💾 Cache set: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Invalider le cache par pattern
   */
  invalidate(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(
        `🗑️  Cache invalidé: ${count} entrée(s) pour pattern "${pattern}"`,
      );
    }
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('🗑️  Cache vidé complètement');
  }
}

/**
 * Interceptor de cache pour les routes GET
 *
 * Fonctionnalités:
 * - Cache automatique des réponses GET
 * - TTL configurable (défaut: 5 minutes)
 * - Invalidation sur POST/PATCH/PUT/DELETE
 *
 * Utilisation:
 * @UseInterceptors(CacheInterceptor)
 * @Get()
 * findAll() { ... }
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url } = request;

    // Générer la clé de cache
    const cacheKey = this.generateCacheKey(method, url);

    // Si c'est une mutation, invalider le cache et continuer
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      // Invalider le cache pour cette ressource
      const resourcePattern = url.split('/')[1]; // ex: "products" de "/products/123"
      this.cacheService.invalidate(resourcePattern);
      return next.handle();
    }

    // Si c'est un GET, vérifier le cache
    if (method === 'GET') {
      const cachedData = this.cacheService.get(cacheKey);

      if (cachedData !== null) {
        // Retourner les données du cache
        return of(cachedData);
      }

      // Sinon, exécuter la requête et mettre en cache
      return next.handle().pipe(
        tap((data) => {
          this.cacheService.set(cacheKey, data, this.DEFAULT_TTL);
        }),
      );
    }

    // Pour les autres méthodes, continuer normalement
    return next.handle();
  }

  /**
   * Générer une clé de cache unique basée sur l'URL et les query params
   */
  private generateCacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }
}

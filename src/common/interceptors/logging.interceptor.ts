import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor global pour logger toutes les requêtes HTTP
 *
 * Fonctionnalités:
 * - Log de la requête entrante (méthode, URL, userId si authentifié)
 * - Log du temps d'exécution
 * - Log du status de la réponse
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';

    // Récupérer l'userId si l'utilisateur est authentifié
    const user = (request as any).user;
    const userId = user?.sub || user?.id || 'anonymous';

    // Timestamp de début
    const now = Date.now();

    // Logger la requête entrante
    this.logger.log(
      `📥 ${method} ${url} - User: ${userId} - UA: ${userAgent.substring(0, 50)}`,
    );

    // Si c'est une mutation (POST, PATCH, PUT, DELETE), logger le body (sans les mots de passe)
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const sanitizedBody = this.sanitizeBody(body);
      if (Object.keys(sanitizedBody).length > 0) {
        this.logger.debug(`📦 Body: ${JSON.stringify(sanitizedBody)}`);
      }
    }

    return next.handle().pipe(
      tap({
        next: () => {
          // Calculer le temps d'exécution
          const responseTime = Date.now() - now;
          const statusCode = response.statusCode;

          // Logger la réponse
          this.logger.log(
            `📤 ${method} ${url} - Status: ${statusCode} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          // Logger les erreurs
          const responseTime = Date.now() - now;
          this.logger.error(
            `❌ ${method} ${url} - Error: ${error.message} - ${responseTime}ms`,
          );
        },
      }),
    );
  }

  /**
   * Sanitize le body pour retirer les informations sensibles
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    }

    return sanitized;
  }
}

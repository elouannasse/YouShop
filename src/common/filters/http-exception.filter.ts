import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface pour la réponse d'erreur formatée
 */
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}

/**
 * Filter global pour formater toutes les exceptions HTTP
 *
 * Fonctionnalités:
 * - Format cohérent pour toutes les erreurs
 * - Logging automatique des erreurs
 * - Gestion des erreurs non-HTTP
 * - Informations de debug en développement
 *
 * Application globale dans main.ts:
 * app.useGlobalFilters(new HttpExceptionFilter())
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Déterminer le status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraire le message d'erreur
    let message: string | string[] = 'Une erreur est survenue';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Construire la réponse d'erreur
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Logger l'erreur
    const logMessage = `${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`;

    if (status >= 500) {
      // Erreurs serveur (5xx) - niveau ERROR
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      // Erreurs client (4xx) - niveau WARN
      this.logger.warn(logMessage);
    }

    // En développement, ajouter la stack trace
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    // Envoyer la réponse
    response.status(status).json(errorResponse);
  }
}

/**
 * Filter spécifique pour les erreurs de validation
 * Peut être utilisé en complément du filter global
 */
@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Formater spécifiquement les erreurs de validation (400)
    if (status === HttpStatus.BAD_REQUEST) {
      const exceptionResponse: any = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        errors: Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message],
        error: 'Validation Error',
      });
    } else {
      // Pour les autres erreurs, utiliser le format standard
      response.status(status).json(exception.getResponse());
    }
  }
}

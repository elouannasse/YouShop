import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * Pipe personnalisé pour valider et transformer en nombre positif
 *
 * Fonctionnalités:
 * - Transforme string en number
 * - Vérifie que c'est un nombre valide
 * - Vérifie que c'est un nombre positif (> 0)
 * - Throw BadRequestException si invalide
 *
 * Utilisation:
 * @Get(':id')
 * findOne(@Param('id', PositiveNumberPipe) id: number) {
 *   // id est maintenant un number positif
 * }
 */
@Injectable()
export class PositiveNumberPipe implements PipeTransform<string, number> {
  /**
   * Transformer et valider la valeur
   */
  transform(value: string, metadata: ArgumentMetadata): number {
    // Convertir en nombre
    const numValue = Number(value);

    // Vérifier si c'est un nombre valide
    if (isNaN(numValue)) {
      throw new BadRequestException(
        `La valeur "${value}" n'est pas un nombre valide pour le paramètre "${metadata.data}"`,
      );
    }

    // Vérifier si c'est un nombre positif
    if (numValue <= 0) {
      throw new BadRequestException(
        `Le paramètre "${metadata.data}" doit être un nombre positif (reçu: ${numValue})`,
      );
    }

    // Vérifier si c'est un entier (optionnel, décommenter si nécessaire)
    // if (!Number.isInteger(numValue)) {
    //   throw new BadRequestException(
    //     `Le paramètre "${metadata.data}" doit être un entier (reçu: ${numValue})`,
    //   );
    // }

    return numValue;
  }
}

/**
 * Pipe pour UUID valide
 * Utile pour valider les IDs
 */
@Injectable()
export class UuidPipe implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(
        `Le paramètre "${metadata.data}" doit être un UUID valide (reçu: ${value})`,
      );
    }

    return value;
  }
}

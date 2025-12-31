import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour la réponse d'une catégorie
 */
export class CategoryResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la catégorie (UUID v4)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Électronique & High-Tech',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description de la catégorie',
    example:
      'Smartphones, ordinateurs, tablettes et accessoires technologiques de dernière génération',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Date de création de la catégorie',
    example: '2025-12-30T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour de la catégorie',
    example: '2025-12-30T15:45:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

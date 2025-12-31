import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO pour la création d'une catégorie
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nom unique de la catégorie',
    example: 'Électronique & High-Tech',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la catégorie',
    example:
      'Smartphones, ordinateurs, tablettes et accessoires technologiques de dernière génération pour tous vos besoins numériques',
    maxLength: 500,
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  description?: string;
}

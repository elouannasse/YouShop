import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsString, IsOptional } from 'class-validator';

/**
 * DTO pour la mise à jour d'une catégorie
 * Tous les champs sont optionnels
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'Nouveau nom de la catégorie',
    example: 'Électronique & Informatique',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle description de la catégorie',
    example:
      'Tous les produits électroniques : smartphones, PC, consoles de jeux, accessoires et bien plus encore',
    maxLength: 500,
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  description?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO pour les filtres et la pagination des produits
 */
export class FilterProductDto {
  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de catégorie',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', {
    message: "L'identifiant de la catégorie doit être un UUID valide",
  })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 10,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix minimum doit être un nombre' })
  @Min(0, { message: 'Le prix minimum ne peut pas être négatif' })
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 1000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix maximum doit être un nombre' })
  @Min(0, { message: 'Le prix maximum ne peut pas être négatif' })
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Recherche par nom de produit (insensible à la casse)',
    example: 'iphone',
  })
  @IsString({ message: 'La recherche doit être une chaîne de caractères' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive doit être un booléen' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier' })
  @Min(1, { message: 'La page doit être au minimum 1' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre de produits par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier' })
  @Min(1, { message: 'La limite doit être au minimum 1' })
  @Max(100, { message: 'La limite doit être au maximum 100' })
  @IsOptional()
  limit?: number = 10;
}

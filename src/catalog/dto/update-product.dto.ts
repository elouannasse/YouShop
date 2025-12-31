import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import {
  IsString,
  IsNumber,
  IsPositive,
  Min,
  IsUrl,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';

/**
 * DTO pour la mise à jour d'un produit
 * Tous les champs sont optionnels
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'Nouveau nom du produit',
    example: 'MacBook Pro 16" M3 Max - 48Go/2To SSD',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle description du produit',
    example:
      'Version améliorée avec 48Go de RAM et 2To de stockage SSD. Idéal pour les professionnels exigeants.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nouveau prix du produit en euros',
    example: 4299.99,
    minimum: 0.01,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le prix doit être un nombre avec maximum 2 décimales' },
  )
  @IsPositive({ message: 'Le prix doit être positif' })
  @Min(0.01, { message: 'Le prix minimum est 0.01€' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: "Nouvelle URL de l'image du produit",
    example:
      'https://cdn.youshop.com/products/macbook-pro-16-m3-max-upgraded.jpg',
    format: 'uri',
  })
  @IsUrl({}, { message: "L'URL de l'image doit être valide" })
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Changer la catégorie du produit',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    format: 'uuid',
  })
  @IsUUID('4', {
    message: "L'identifiant de la catégorie doit être un UUID valide",
  })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Mettre à jour le stock',
    example: 8,
    minimum: 0,
    type: 'integer',
  })
  @IsInt({ message: 'Le stock doit être un nombre entier' })
  @Min(0, { message: 'Le stock ne peut pas être négatif' })
  @IsOptional()
  stock?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsUrl,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';

/**
 * DTO pour la création d'un produit
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'MacBook Pro 16 pouces M3 Max - 36Go/1To',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  name: string;

  @ApiProperty({
    description: 'Description détaillée du produit',
    example:
      "Ordinateur portable professionnel Apple avec puce M3 Max, écran Liquid Retina XDR 16 pouces, 36Go de RAM unifiée et SSD de 1To. Performances exceptionnelles pour le développement, la création vidéo et les tâches intensives. Autonomie jusqu'à 22 heures.",
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description est requise' })
  description: string;

  @ApiProperty({
    description: 'Prix du produit en euros (2 décimales max)',
    example: 3899.99,
    minimum: 0.01,
    type: 'number',
    format: 'decimal',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le prix doit être un nombre avec maximum 2 décimales' },
  )
  @IsPositive({ message: 'Le prix doit être positif' })
  @Min(0.01, { message: 'Le prix minimum est 0.01€' })
  price: number;

  @ApiPropertyOptional({
    description: "URL de l'image du produit (HTTPS recommandé)",
    example: 'https://cdn.youshop.com/products/macbook-pro-16-m3-max.jpg',
    format: 'uri',
  })
  @IsUrl({}, { message: "L'URL de l'image doit être valide" })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'UUID de la catégorie à laquelle appartient le produit',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    format: 'uuid',
  })
  @IsUUID('4', {
    message: "L'identifiant de la catégorie doit être un UUID valide",
  })
  @IsNotEmpty({ message: 'La catégorie est requise' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Quantité disponible en stock',
    example: 15,
    minimum: 0,
    default: 0,
    type: 'integer',
  })
  @IsInt({ message: 'Le stock doit être un nombre entier' })
  @Min(0, { message: 'Le stock ne peut pas être négatif' })
  @IsOptional()
  stock?: number = 0;
}

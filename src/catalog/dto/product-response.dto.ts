import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

/**
 * DTO pour la réponse d'un produit avec sa catégorie
 */
export class ProductResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du produit (UUID v4)',
    example: '8c4e9f2a-1b3d-4a5c-9e7f-3d2b1a4c5e6f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'MacBook Pro 16 pouces M3 Max - 36Go/1To',
  })
  name: string;

  @ApiProperty({
    description: 'Description complète du produit',
    example:
      'Ordinateur portable professionnel Apple avec puce M3 Max, écran Liquid Retina XDR 16 pouces, 36Go de RAM unifiée et SSD de 1To. Performances exceptionnelles pour le développement, la création vidéo et les tâches intensives.',
  })
  description: string;

  @ApiProperty({
    description: 'Prix du produit en euros',
    example: 3899.99,
    type: 'number',
    format: 'decimal',
  })
  price: number;

  @ApiPropertyOptional({
    description: "URL de l'image du produit",
    example: 'https://cdn.youshop.com/products/macbook-pro-16-m3-max.jpg',
    nullable: true,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Quantité disponible en stock',
    example: 15,
    type: 'integer',
  })
  stock: number;

  @ApiProperty({
    description: 'Statut du produit (actif = visible, inactif = masqué)',
    example: true,
    type: 'boolean',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Catégorie à laquelle appartient le produit',
    type: () => CategoryResponseDto,
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Électronique & High-Tech',
      description:
        'Smartphones, ordinateurs, tablettes et accessoires technologiques',
      createdAt: '2025-12-30T10:30:00.000Z',
      updatedAt: '2025-12-30T10:30:00.000Z',
    },
  })
  category: CategoryResponseDto;

  @ApiProperty({
    description: 'Date de création du produit',
    example: '2025-12-30T14:20:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour du produit',
    example: '2025-12-30T16:45:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

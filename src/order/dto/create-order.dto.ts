import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID du produit',
    example: 'af95ca61-20f4-454e-b5b3-986147b40769',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Quantité à commander',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Liste des produits à commander',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: 'af95ca61-20f4-454e-b5b3-986147b40769',
        quantity: 2,
      },
      {
        productId: '580f6fcc-b044-4ba8-b6e0-8962ea7297d4',
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

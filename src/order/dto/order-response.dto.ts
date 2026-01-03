import { ApiProperty } from '@nestjs/swagger';

// Import direct de l'enum depuis Prisma
enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class OrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  taxRate!: number;

  @ApiProperty()
  taxAmount!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  paidAt?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  cancelledAt?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  expiresAt?: Date | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  orderItems!: OrderItemResponseDto[];
}

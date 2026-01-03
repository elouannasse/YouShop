import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la commande',
    enum: OrderStatus,
    example: 'PAID',
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus, {
    message: 'Le statut doit être PENDING, PAID, CANCELLED ou EXPIRED',
  })
  status!: OrderStatus;
}

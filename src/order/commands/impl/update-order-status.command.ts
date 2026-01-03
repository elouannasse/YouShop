import { OrderStatus } from '@prisma/client';

/**
 * Commande pour mettre à jour le statut d'une commande (ADMIN)
 */
export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
  ) {}
}

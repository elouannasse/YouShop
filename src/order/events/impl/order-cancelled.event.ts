/**
 * Événement émis quand une commande est annulée
 */
export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly orderNumber: string,
  ) {}
}

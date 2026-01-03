/**
 * Événement émis quand une commande est créée
 */
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: number,
    public readonly orderNumber: string,
  ) {}
}

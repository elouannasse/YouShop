/**
 * Événement émis quand une commande est payée
 */
export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: number,
    public readonly orderNumber: string,
  ) {}
}

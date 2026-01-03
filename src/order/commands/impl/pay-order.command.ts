/**
 * Commande pour payer une commande
 */
export class PayOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
  ) {}
}

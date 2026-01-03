/**
 * Commande pour annuler une commande
 */
export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId?: string, // Optionnel pour l'admin
  ) {}
}

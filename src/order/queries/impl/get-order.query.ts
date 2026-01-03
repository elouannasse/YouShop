/**
 * Query pour récupérer une commande par ID
 */
export class GetOrderQuery {
  constructor(
    public readonly orderId: string,
    public readonly userId?: string, // Optionnel pour l'admin
  ) {}
}

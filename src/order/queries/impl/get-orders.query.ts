/**
 * Query pour récupérer toutes les commandes
 */
export class GetOrdersQuery {
  constructor(
    public readonly userId?: string, // Si fourni, seulement les commandes de cet utilisateur
    public readonly isAdmin: boolean = false,
  ) {}
}

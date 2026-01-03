import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrdersQuery } from '../impl/get-orders.query';
import { OrderService } from '../../order.service';

/**
 * Handler pour la query GetOrders
 *
 * Responsabilité: Récupérer une liste de commandes
 */
@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(private readonly orderService: OrderService) {}

  async execute(query: GetOrdersQuery) {
    const { userId, isAdmin } = query;

    // Si admin, récupérer toutes les commandes
    if (isAdmin) {
      return this.orderService.getAllOrders();
    }

    // Sinon, récupérer les commandes de l'utilisateur
    if (userId) {
      return this.orderService.getUserOrders(userId);
    }

    // Par défaut, retourner un tableau vide
    return [];
  }
}

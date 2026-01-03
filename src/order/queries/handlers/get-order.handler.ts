import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrderQuery } from '../impl/get-order.query';
import { OrderService } from '../../order.service';

/**
 * Handler pour la query GetOrder
 *
 * Responsabilité: Récupérer les détails d'une commande
 */
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orderService: OrderService) {}

  async execute(query: GetOrderQuery) {
    const { orderId, userId } = query;
    return this.orderService.getOrderById(orderId, userId);
  }
}

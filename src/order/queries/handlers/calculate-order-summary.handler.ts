import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CalculateOrderSummaryQuery } from '../impl/calculate-order-summary.query';
import { OrderService } from '../../order.service';

/**
 * Handler pour la query CalculateOrderSummary
 *
 * Responsabilité: Calculer le récapitulatif d'une commande sans la créer
 */
@QueryHandler(CalculateOrderSummaryQuery)
export class CalculateOrderSummaryHandler implements IQueryHandler<CalculateOrderSummaryQuery> {
  constructor(private readonly orderService: OrderService) {}

  async execute(query: CalculateOrderSummaryQuery) {
    const { createOrderDto } = query;
    return this.orderService.calculateOrderSummary(createOrderDto);
  }
}

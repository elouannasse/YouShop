import { CreateOrderDto } from '../../dto';

/**
 * Query pour calculer le récapitulatif d'une commande avant création
 */
export class CalculateOrderSummaryQuery {
  constructor(public readonly createOrderDto: CreateOrderDto) {}
}

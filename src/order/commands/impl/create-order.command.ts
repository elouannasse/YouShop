import { CreateOrderDto } from '../../dto';

/**
 * Commande pour créer une nouvelle commande
 *
 * Pattern CQRS: Cette commande représente l'intention de créer une commande
 * Elle sera traitée par CreateOrderHandler
 */
export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly createOrderDto: CreateOrderDto,
  ) {}
}

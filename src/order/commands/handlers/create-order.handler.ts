import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../impl/create-order.command';
import { OrderService } from '../../order.service';
import { OrderCreatedEvent } from '../../events/impl/order-created.event';

/**
 * Handler pour la commande CreateOrder
 *
 * Responsabilités:
 * - Déléguer la logique métier au OrderService
 * - Émettre l'événement OrderCreatedEvent après succès
 */
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand) {
    const { userId, createOrderDto } = command;

    console.log('DEBUG CreateOrderHandler - userId:', userId);
    console.log('DEBUG CreateOrderHandler - userId type:', typeof userId);
    console.log(
      'DEBUG CreateOrderHandler - userId JSON:',
      JSON.stringify(userId),
    );

    // Créer la commande via le service
    const order = await this.orderService.createOrder(userId, createOrderDto);

    // Émettre l'événement OrderCreated
    this.eventBus.publish(
      new OrderCreatedEvent(
        order.id,
        order.userId,
        parseFloat(order.totalAmount.toString()),
        order.orderNumber,
      ),
    );

    return order;
  }
}

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CancelOrderCommand } from '../impl/cancel-order.command';
import { OrderService } from '../../order.service';
import { OrderCancelledEvent } from '../../events/impl/order-cancelled.event';

/**
 * Handler pour la commande CancelOrder
 */
@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelOrderCommand) {
    const { orderId, userId } = command;

    // Annuler la commande via le service
    const order = await this.orderService.cancelOrder(orderId, userId);

    // Émettre l'événement OrderCancelled
    this.eventBus.publish(
      new OrderCancelledEvent(order.id, order.userId, order.orderNumber),
    );

    return order;
  }
}

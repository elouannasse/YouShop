import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { PayOrderCommand } from '../impl/pay-order.command';
import { OrderService } from '../../order.service';
import { OrderPaidEvent } from '../../events/impl/order-paid.event';

/**
 * Handler pour la commande PayOrder
 */
@CommandHandler(PayOrderCommand)
export class PayOrderHandler implements ICommandHandler<PayOrderCommand> {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PayOrderCommand) {
    const { orderId, userId } = command;

    // Payer la commande via le service
    const order = await this.orderService.payOrder(orderId, userId);

    // Émettre l'événement OrderPaid
    this.eventBus.publish(
      new OrderPaidEvent(
        order.id,
        order.userId,
        parseFloat(order.totalAmount.toString()),
        order.orderNumber,
      ),
    );

    return order;
  }
}

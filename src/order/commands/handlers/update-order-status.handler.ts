import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrderStatusCommand } from '../impl/update-order-status.command';
import { OrderService } from '../../order.service';

/**
 * Handler pour la commande UpdateOrderStatus (ADMIN)
 */
@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(private readonly orderService: OrderService) {}

  async execute(command: UpdateOrderStatusCommand) {
    const { orderId, status } = command;

    // Mettre à jour le statut via le service
    return this.orderService.updateStatus(orderId, status);
  }
}

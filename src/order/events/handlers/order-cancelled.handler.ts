import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCancelledEvent } from '../impl/order-cancelled.event';
import { Logger } from '@nestjs/common';

/**
 * Handler pour l'événement OrderCancelled
 */
@EventsHandler(OrderCancelledEvent)
export class OrderCancelledHandler implements IEventHandler<OrderCancelledEvent> {
  private readonly logger = new Logger(OrderCancelledHandler.name);

  async handle(event: OrderCancelledEvent) {
    const { orderId, userId, orderNumber } = event;

    this.logger.log(
      `❌ Commande annulée: ${orderNumber} (${orderId}) - User: ${userId}`,
    );

    // TODO: Envoyer email de confirmation d'annulation
    // TODO: Notifier le système de gestion des stocks
  }
}

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { Logger } from '@nestjs/common';

/**
 * Handler pour l'événement OrderCreated
 *
 * Responsabilités (futures):
 * - Envoyer un email de confirmation à l'utilisateur
 * - Notifier le système de comptabilité
 * - Logger dans un système externe
 * - Déclencher des webhooks
 */
@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  async handle(event: OrderCreatedEvent) {
    const { orderId, userId, totalAmount, orderNumber } = event;

    this.logger.log(
      `📦 Nouvelle commande créée: ${orderNumber} (${orderId}) - User: ${userId} - Montant: ${totalAmount}€`,
    );

    // TODO: Envoyer email de confirmation
    // await this.emailService.sendOrderConfirmation(userId, orderNumber);

    // TODO: Notifier le système externe
    // await this.webhookService.notify('order.created', event);

    // TODO: Logger dans un système de monitoring
    // await this.analyticsService.trackOrderCreated(event);
  }
}

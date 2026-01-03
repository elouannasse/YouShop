import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderPaidEvent } from '../impl/order-paid.event';
import { Logger } from '@nestjs/common';

/**
 * Handler pour l'événement OrderPaid
 */
@EventsHandler(OrderPaidEvent)
export class OrderPaidHandler implements IEventHandler<OrderPaidEvent> {
  private readonly logger = new Logger(OrderPaidHandler.name);

  async handle(event: OrderPaidEvent) {
    const { orderId, userId, totalAmount, orderNumber } = event;

    this.logger.log(
      `💳 Commande payée: ${orderNumber} (${orderId}) - User: ${userId} - Montant: ${totalAmount}€`,
    );

    // TODO: Envoyer email de confirmation de paiement
    // TODO: Déclencher le processus de livraison
    // TODO: Mettre à jour le système de comptabilité
  }
}

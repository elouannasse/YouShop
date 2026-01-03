import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class OrderScheduler {
  private readonly logger = new Logger(OrderScheduler.name);

  constructor(private readonly orderService: OrderService) {}

  /**
   * CRON Job pour traiter les commandes expirées
   * S'exécute toutes les 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    this.logger.log('Début du traitement des commandes expirées...');

    try {
      const count = await this.orderService.processExpiredOrders();

      if (count > 0) {
        this.logger.log(`✅ ${count} commande(s) expirée(s) traitée(s)`);
      } else {
        this.logger.debug('Aucune commande expirée à traiter');
      }
    } catch (error) {
      this.logger.error(
        'Erreur lors du traitement des commandes expirées:',
        error,
      );
    }
  }
}

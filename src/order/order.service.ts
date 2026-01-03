import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderSummary } from './interfaces/order-summary.interface';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une commande et réserver le stock
   */
  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // 1. Vérifier et récupérer les produits
    const productIds = createOrderDto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont invalides');
    }

    // 2. Vérifier le stock disponible
    for (const item of createOrderDto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Produit ${item.productId} non trouvé`);
      }

      if (product.stockAvailable < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}. Disponible: ${product.stockAvailable}, Demandé: ${item.quantity}`,
        );
      }
    }

    // 3. Calculer les montants
    let subtotal = new Decimal(0);
    for (const item of createOrderDto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = product.price.mul(item.quantity);
      subtotal = subtotal.add(itemSubtotal);
    }

    const taxRate = new Decimal(20); // 20% TVA
    const taxAmount = subtotal.mul(taxRate).div(100);
    const totalAmount = subtotal.add(taxAmount);

    // 4. Générer le numéro de commande
    const orderNumber = await this.generateOrderNumber();

    // 5. Date d'expiration (30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 6. Créer la commande dans une transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Réserver le stock
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockAvailable: { decrement: item.quantity },
            stockReserved: { increment: item.quantity },
          },
        });
      }

      // Créer la commande
      return tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          userId,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount,
          expiresAt,
          orderItems: {
            create: createOrderDto.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                productName: product.name,
                unitPrice: product.price,
                quantity: item.quantity,
                subtotal: product.price.mul(item.quantity),
              };
            }),
          },
        },
        include: {
          orderItems: true,
        },
      });
    });

    return order;
  }

  /**
   * Récupérer les commandes d'un utilisateur
   */
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupérer une commande par ID
   */
  async getOrderById(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    // Si userId fourni, vérifier que c'est bien la commande de l'utilisateur
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Commande non trouvée');
    }

    return order;
  }

  /**
   * Payer une commande (confirmer)
   */
  async payOrder(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Seules les commandes en attente peuvent être payées',
      );
    }

    // Vérifier si la commande n'a pas expiré
    if (order.expiresAt && new Date() > order.expiresAt) {
      // Annuler automatiquement
      await this.cancelOrder(orderId, userId);
      throw new BadRequestException('La commande a expiré');
    }

    // Retirer du stock réservé et marquer comme payée
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Retirer du stock réservé
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockReserved: { decrement: item.quantity },
          },
        });
      }

      // Marquer comme payée
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
        include: {
          orderItems: true,
        },
      });
    });

    return updatedOrder;
  }

  /**
   * Annuler une commande et libérer le stock
   */
  async cancelOrder(orderId: string, userId?: string) {
    const order = await this.getOrderById(orderId, userId);

    if (order.status === 'PAID') {
      throw new BadRequestException(
        'Les commandes payées ne peuvent pas être annulées',
      );
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cette commande est déjà annulée');
    }

    // Libérer le stock et annuler
    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      // Remettre le stock disponible
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockAvailable: { increment: item.quantity },
            stockReserved: { decrement: item.quantity },
          },
        });
      }

      // Marquer comme annulée
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          orderItems: true,
        },
      });
    });

    return cancelledOrder;
  }

  /**
   * Récupérer toutes les commandes (ADMIN)
   */
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calculer le récapitulatif d'une commande SANS la créer
   */
  async calculateOrderSummary(
    createOrderDto: CreateOrderDto,
  ): Promise<OrderSummary> {
    // 1. Vérifier et récupérer les produits
    const productIds = createOrderDto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont invalides');
    }

    // 2. Vérifier le stock disponible
    for (const item of createOrderDto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Produit ${item.productId} non trouvé`);
      }

      if (product.stockAvailable < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}. Disponible: ${product.stockAvailable}, Demandé: ${item.quantity}`,
        );
      }
    }

    // 3. Calculer les montants
    const items = createOrderDto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = parseFloat(product.price.toString());
      const subtotal = unitPrice * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 20; // 20% TVA
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
    };
  }

  /**
   * Traiter les commandes expirées (CRON job)
   * Appelé automatiquement toutes les 5 minutes
   */
  async processExpiredOrders(): Promise<number> {
    const now = new Date();

    // Trouver toutes les commandes PENDING expirées
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      include: {
        orderItems: true,
      },
    });

    if (expiredOrders.length === 0) {
      return 0;
    }

    this.logger.log(
      `Traitement de ${expiredOrders.length} commande(s) expirée(s)`,
    );

    // Annuler chaque commande expirée
    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Libérer le stock réservé
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockAvailable: { increment: item.quantity },
                stockReserved: { decrement: item.quantity },
              },
            });
          }

          // Marquer comme EXPIRED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'EXPIRED',
              cancelledAt: now,
            },
          });
        });

        this.logger.log(`Commande ${order.orderNumber} expirée et annulée`);
      } catch (error) {
        this.logger.error(
          `Erreur lors de l'expiration de la commande ${order.orderNumber}:`,
          error,
        );
      }
    }

    return expiredOrders.length;
  }

  /**
   * Mettre à jour le statut d'une commande (ADMIN uniquement)
   */
  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    // Validation: ne peut pas passer de PAID à CANCELLED
    if (order.status === 'PAID' && newStatus === 'CANCELLED') {
      throw new BadRequestException(
        "Impossible d'annuler une commande déjà payée",
      );
    }

    // Si le nouveau statut est CANCELLED, libérer les stocks
    if (newStatus === 'CANCELLED' && order.status === 'PENDING') {
      return this.prisma.$transaction(async (tx) => {
        // Libérer le stock
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockAvailable: { increment: item.quantity },
              stockReserved: { decrement: item.quantity },
            },
          });
        }

        // Mettre à jour le statut
        return tx.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            cancelledAt: new Date(),
          },
          include: { orderItems: true },
        });
      });
    }

    // Si le nouveau statut est PAID
    if (newStatus === 'PAID' && order.status === 'PENDING') {
      return this.prisma.$transaction(async (tx) => {
        // Retirer du stock réservé
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockReserved: { decrement: item.quantity },
            },
          });
        }

        // Mettre à jour le statut
        return tx.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            paidAt: new Date(),
          },
          include: { orderItems: true },
        });
      });
    }

    // Sinon, simple mise à jour du statut
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { orderItems: true },
    });
  }

  /**
   * Générer un numéro de commande unique
   */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Compter les commandes du jour
    const startOfDay = new Date(year, today.getMonth(), today.getDate());
    const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1);

    const todayOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNumber = `ORD-${year}${month}${day}-${String(todayOrdersCount + 1).padStart(4, '0')}`;
    return orderNumber;
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto, OrderResponseDto } from './dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

// Commands
import {
  CreateOrderCommand,
  CancelOrderCommand,
  PayOrderCommand,
  UpdateOrderStatusCommand,
} from './commands/impl';

// Queries
import {
  GetOrderQuery,
  GetOrdersQuery,
  CalculateOrderSummaryQuery,
} from './queries/impl';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une commande',
    description:
      'Créer une nouvelle commande et réserver le stock (CLIENT ou ADMIN)',
  })
  @ApiResponse({
    status: 201,
    description: 'Commande créée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou stock insuffisant',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async createOrder(
    @GetUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.commandBus.execute(
      new CreateOrderCommand(userId, createOrderDto),
    );
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Calculer le récapitulatif d'une commande",
    description:
      'Calculer le montant total, taxes et vérifier la disponibilité SANS créer la commande',
  })
  @ApiResponse({
    status: 200,
    description: 'Récapitulatif calculé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Produits invalides ou stock insuffisant',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async calculateOrderSummary(@Body() createOrderDto: CreateOrderDto) {
    return this.queryBus.execute(
      new CalculateOrderSummaryQuery(createOrderDto),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Mes commandes',
    description: "Récupérer toutes les commandes de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des commandes',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMyOrders(@GetUser('id') userId: string) {
    return this.queryBus.execute(new GetOrdersQuery(userId, false));
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Toutes les commandes (ADMIN)',
    description: 'Récupérer toutes les commandes de tous les utilisateurs',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les commandes',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé (ADMIN requis)' })
  async getAllOrders() {
    return this.queryBus.execute(new GetOrdersQuery(undefined, true));
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'une commande",
    description: "Récupérer les détails d'une commande spécifique",
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la commande',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async getOrderById(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    // Si ADMIN, pas besoin de vérifier le userId
    if (userRole === Role.ADMIN) {
      return this.queryBus.execute(new GetOrderQuery(orderId));
    }
    // Si CLIENT, vérifier que c'est sa commande
    return this.queryBus.execute(new GetOrderQuery(orderId, userId));
  }

  @Patch(':id/pay')
  @ApiOperation({
    summary: 'Payer une commande',
    description:
      "Confirmer le paiement d'une commande (retire du stock réservé)",
  })
  @ApiResponse({
    status: 200,
    description: 'Commande payée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Commande ne peut pas être payée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async payOrder(@Param('id') orderId: string, @GetUser('id') userId: string) {
    return this.commandBus.execute(new PayOrderCommand(orderId, userId));
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Annuler une commande',
    description:
      'Annuler une commande et libérer le stock réservé (CLIENT ou ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Commande annulée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Commande ne peut pas être annulée',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async cancelOrder(
    @Param('id') orderId: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    // Si ADMIN, pas de vérification userId
    if (userRole === Role.ADMIN) {
      return this.commandBus.execute(new CancelOrderCommand(orderId));
    }
    // Si CLIENT, vérifier que c'est sa commande
    return this.commandBus.execute(new CancelOrderCommand(orderId, userId));
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Mettre à jour le statut d'une commande (ADMIN)",
    description:
      "Changer le statut d'une commande (PENDING → PAID, PENDING → CANCELLED)",
  })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Changement de statut invalide',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé (ADMIN requis)' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateOrderStatusCommand(orderId, updateOrderStatusDto.status),
    );
  }
}

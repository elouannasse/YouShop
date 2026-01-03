import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderScheduler } from './order.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

// Command Handlers
import {
  CreateOrderHandler,
  CancelOrderHandler,
  PayOrderHandler,
  UpdateOrderStatusHandler,
} from './commands/handlers';

// Query Handlers
import {
  GetOrderHandler,
  GetOrdersHandler,
  CalculateOrderSummaryHandler,
} from './queries/handlers';

// Event Handlers
import {
  OrderCreatedHandler,
  OrderPaidHandler,
  OrderCancelledHandler,
} from './events/handlers';

const CommandHandlers = [
  CreateOrderHandler,
  CancelOrderHandler,
  PayOrderHandler,
  UpdateOrderStatusHandler,
];

const QueryHandlers = [
  GetOrderHandler,
  GetOrdersHandler,
  CalculateOrderSummaryHandler,
];

const EventHandlers = [
  OrderCreatedHandler,
  OrderPaidHandler,
  OrderCancelledHandler,
];

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    CqrsModule, // Import du module CQRS
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderScheduler,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [OrderService],
})
export class OrderModule {}

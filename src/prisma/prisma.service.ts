import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Expose PrismaClient methods
  get user() {
    return this.prisma.user;
  }

  get category() {
    return this.prisma.category;
  }

  get product() {
    return this.prisma.product;
  }

  get order() {
    return this.prisma.order;
  }

  get orderItem() {
    return this.prisma.orderItem;
  }

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}

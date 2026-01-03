import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CacheService } from '../common/interceptors/cache.interceptor';

/**
 * Module Catalog - Gestion du catalogue de produits et catégories
 *
 * Routes publiques:
 * - GET /products (avec filtres et pagination)
 * - GET /products/:id
 * - GET /categories
 * - GET /categories/:id
 *
 * Routes ADMIN uniquement:
 * - POST /products
 * - PATCH /products/:id
 * - DELETE /products/:id
 * - POST /categories
 * - PATCH /categories/:id
 * - DELETE /categories/:id
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule, // Import AuthModule pour accès aux guards JWT et Roles
  ],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService, CacheService],
  exports: [ProductService, CategoryService, CacheService], // Exporté pour utilisation future dans Orders, Cart, etc.
})
export class CatalogModule {}

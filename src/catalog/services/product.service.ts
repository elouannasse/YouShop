import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service pour la gestion des produits
 */
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau produit
   */
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `La catégorie avec l'ID ${createProductDto.categoryId} n'existe pas`,
      );
    }

    // Créer le produit
    const stockValue = createProductDto.stock ?? 0;
    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: new Decimal(createProductDto.price),
        imageUrl: createProductDto.imageUrl,
        categoryId: createProductDto.categoryId,
        stock: stockValue,
        stockAvailable: stockValue, // 🔥 Important: stock disponible = stock initial
        stockReserved: 0, // Aucune réservation au départ
      },
      include: {
        category: true,
      },
    });

    return this.formatProductResponse(product);
  }

  /**
   * Trouver tous les produits avec filtres et pagination
   */
  async findAll(filterDto: FilterProductDto): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = filterDto;

    // Construire les conditions de filtrage
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Decimal(maxPrice);
      }
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculer skip et take pour la pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Exécuter la requête avec pagination
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map((product) => this.formatProductResponse(product)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Trouver un produit par son ID
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Le produit avec l'ID ${id} n'existe pas`);
    }

    return this.formatProductResponse(product);
  }

  /**
   * Mettre à jour un produit
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Vérifier que le produit existe
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Le produit avec l'ID ${id} n'existe pas`);
    }

    // Si la catégorie est modifiée, vérifier qu'elle existe
    if (
      updateProductDto.categoryId &&
      updateProductDto.categoryId !== existingProduct.categoryId
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `La catégorie avec l'ID ${updateProductDto.categoryId} n'existe pas`,
        );
      }
    }

    // Préparer les données de mise à jour
    const data: any = {
      ...updateProductDto,
    };

    // Convertir le prix en Decimal si présent
    if (updateProductDto.price !== undefined) {
      data.price = new Decimal(updateProductDto.price);
    }

    // Mettre à jour le produit
    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return this.formatProductResponse(product);
  }

  /**
   * Supprimer un produit (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Le produit avec l'ID ${id} n'existe pas`);
    }

    // Soft delete: mettre isActive à false
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: `Le produit "${product.name}" a été désactivé avec succès`,
    };
  }

  /**
   * Hard delete (pour usage interne/admin)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Le produit avec l'ID ${id} n'existe pas`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: `Le produit "${product.name}" a été supprimé définitivement`,
    };
  }

  /**
   * Formater la réponse du produit
   */
  private formatProductResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      imageUrl: product.imageUrl,
      stock: product.stock,
      isActive: product.isActive,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
        createdAt: product.category.createdAt,
        updatedAt: product.category.updatedAt,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

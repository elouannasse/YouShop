import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';

/**
 * Service pour la gestion des catégories
 */
@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une nouvelle catégorie
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Vérifier si une catégorie avec ce nom existe déjà
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Une catégorie avec le nom "${createCategoryDto.name}" existe déjà`,
      );
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return category;
  }

  /**
   * Trouver toutes les catégories
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Trouver une catégorie par son ID
   */
  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`La catégorie avec l'ID ${id} n'existe pas`);
    }

    return category;
  }

  /**
   * Mettre à jour une catégorie
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Vérifier que la catégorie existe
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`La catégorie avec l'ID ${id} n'existe pas`);
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const duplicateCategory = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (duplicateCategory) {
        throw new ConflictException(
          `Une catégorie avec le nom "${updateCategoryDto.name}" existe déjà`,
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return category;
  }

  /**
   * Supprimer une catégorie
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`La catégorie avec l'ID ${id} n'existe pas`);
    }

    // Vérifier si des produits sont associés
    if (category.products.length > 0) {
      throw new ConflictException(
        `Impossible de supprimer la catégorie "${category.name}" car elle contient ${category.products.length} produit(s)`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: `La catégorie "${category.name}" a été supprimée avec succès`,
    };
  }
}

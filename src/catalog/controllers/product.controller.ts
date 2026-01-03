import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';

/**
 * Contrôleur pour la gestion des produits
 */
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Créer un nouveau produit (ADMIN uniquement)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Créer un nouveau produit (Admin uniquement)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le produit a été créé avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès interdit (rôle Admin requis)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "La catégorie spécifiée n'existe pas",
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  /**
   * Obtenir tous les produits avec filtres et pagination (PUBLIC)
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Obtenir la liste des produits avec filtres et pagination',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filtrer par catégorie',
  })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Prix minimum' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Prix maximum' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Rechercher dans le nom',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filtrer par statut actif',
    type: Boolean,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre de produits par page',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des produits récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Paramètres de requête invalides',
  })
  async findAll(@Query() filterDto: FilterProductDto) {
    return this.productService.findAll(filterDto);
  }

  /**
   * Obtenir un produit par son ID (PUBLIC)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un produit par son ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit trouvé',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Le produit n'existe pas",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID invalide',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findOne(id);
  }

  /**
   * Mettre à jour un produit (ADMIN uniquement)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mettre à jour un produit (Admin uniquement)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit mis à jour avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès interdit (rôle Admin requis)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Le produit ou la catégorie n'existe pas",
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * Supprimer un produit (soft delete) (ADMIN uniquement)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Supprimer un produit - Soft delete (Admin uniquement)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit désactivé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Le produit "iPhone 15" a été désactivé avec succès',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès interdit (rôle Admin requis)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Le produit n'existe pas",
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productService.remove(id);
  }
}

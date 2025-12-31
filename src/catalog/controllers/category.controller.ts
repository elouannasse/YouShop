import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Contrôleur pour la gestion des catégories
 */
@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Créer une nouvelle catégorie (ADMIN uniquement)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (Admin uniquement)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La catégorie a été créée avec succès',
    type: CategoryResponseDto,
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
    status: HttpStatus.CONFLICT,
    description: 'Une catégorie avec ce nom existe déjà',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Obtenir toutes les catégories (PUBLIC)
   */
  @Get()
  @ApiOperation({ summary: 'Obtenir la liste de toutes les catégories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des catégories récupérée avec succès',
    type: [CategoryResponseDto],
  })
  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll();
  }

  /**
   * Obtenir une catégorie par son ID (PUBLIC)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie par son ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catégorie trouvée',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "La catégorie n'existe pas",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID invalide',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  /**
   * Mettre à jour une catégorie (ADMIN uniquement)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mettre à jour une catégorie (Admin uniquement)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catégorie mise à jour avec succès',
    type: CategoryResponseDto,
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
    description: "La catégorie n'existe pas",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Une catégorie avec ce nom existe déjà',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Supprimer une catégorie (ADMIN uniquement)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Supprimer une catégorie (Admin uniquement)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catégorie supprimée avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'La catégorie "Électronique" a été supprimée avec succès',
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
    description: "La catégorie n'existe pas",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Impossible de supprimer la catégorie car elle contient des produits',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.remove(id);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UserResponseDto, AuthResponseDto } from './dto';
import { AuthResponse } from './interfaces';
import { JwtAuthGuard } from './guards';
import { GetUser } from './decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description:
      'Crée un nouveau compte utilisateur avec email et mot de passe. Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides (email mal formaté, password faible, etc.)',
  })
  @ApiResponse({
    status: 409,
    description: 'Un compte avec cet email existe déjà',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Connexion d'un utilisateur",
    description:
      'Authentifie un utilisateur avec son email et mot de passe, retourne un token JWT.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie, token JWT retourné',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: "Récupérer le profil de l'utilisateur connecté",
    description:
      "Retourne les informations du profil de l'utilisateur actuellement authentifié. Nécessite un token JWT valide.",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant, invalide ou expiré',
  })
  async getProfile(@GetUser() user: any): Promise<UserResponseDto> {
    return this.authService.getUserById(user.userId);
  }
}

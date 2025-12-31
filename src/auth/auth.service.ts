import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UserResponseDto } from './dto';
import { AuthResponse, JwtPayload } from './interfaces';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * @param registerDto - Données d'inscription
   * @returns AuthResponse avec token et informations utilisateur
   * @throws ConflictException si l'email existe déjà
   * @throws InternalServerErrorException en cas d'erreur lors de la création
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `Un compte avec l'email ${registerDto.email} existe déjà`,
        );
      }

      // Hasher le mot de passe
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Créer l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: registerDto.role || 'CLIENT', // Rôle fourni ou CLIENT par défaut
        },
      });

      // Générer le token JWT
      const accessToken = await this.generateJwtToken(user);

      // Retourner la réponse sans le password
      return {
        accessToken,
        user: plainToClass(UserResponseDto, user, {
          excludeExtraneousValues: false,
        }),
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la création du compte',
      );
    }
  }

  /**
   * Connexion d'un utilisateur existant
   * @param loginDto - Identifiants de connexion
   * @returns AuthResponse avec token et informations utilisateur
   * @throws UnauthorizedException si les identifiants sont invalides
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Trouver l'utilisateur par email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await this.comparePasswords(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      // Générer le token JWT
      const accessToken = await this.generateJwtToken(user);

      // Retourner la réponse sans le password
      return {
        accessToken,
        user: plainToClass(UserResponseDto, user, {
          excludeExtraneousValues: false,
        }),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la connexion');
    }
  }

  /**
   * Valider un utilisateur par email et password (helper pour Passport)
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe en clair
   * @returns User sans le password ou null si invalide
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await this.comparePasswords(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        return null;
      }

      // Retourner l'utilisateur sans le password
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupérer un utilisateur par son ID
   * @param userId - ID de l'utilisateur
   * @returns UserResponseDto
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: false,
    });
  }

  /**
   * Générer un token JWT pour un utilisateur
   * @param user - Utilisateur pour lequel générer le token
   * @returns Token JWT signé
   */
  private async generateJwtToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Hasher un mot de passe avec bcrypt
   * @param password - Mot de passe en clair
   * @returns Mot de passe hashé
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Comparer un mot de passe en clair avec un hash
   * @param plainPassword - Mot de passe en clair
   * @param hashedPassword - Mot de passe hashé
   * @returns true si les mots de passe correspondent
   */
  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

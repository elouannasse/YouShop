import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description:
      "Adresse email unique de l'utilisateur (sera utilisée pour la connexion)",
    example: 'sophie.martin@youshop.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est requis" })
  email!: string;

  @ApiProperty({
    description:
      'Mot de passe sécurisé (minimum 8 caractères, doit contenir: 1 majuscule, 1 minuscule, 1 chiffre)',
    example: 'SecurePass2025!',
    minLength: 8,
    format: 'password',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password!: string;

  @ApiPropertyOptional({
    description: "Prénom de l'utilisateur",
    example: 'Sophie',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: "Nom de famille de l'utilisateur",
    example: 'Martin',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: "Rôle de l'utilisateur",
    enum: Role,
    example: Role.CLIENT,
    default: Role.CLIENT,
  })
  @IsEnum(Role, { message: 'Le rôle doit être CLIENT ou ADMIN' })
  @IsOptional()
  role?: Role;
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est requis" })
  email!: string;

  @ApiProperty({
    description:
      'Mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)',
    example: 'SecurePass123',
    minLength: 8,
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
    example: 'John',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: "Nom de famille de l'utilisateur",
    example: 'Doe',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsOptional()
  lastName?: string;
}

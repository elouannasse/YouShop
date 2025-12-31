import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: "ID unique de l'utilisateur (UUID v4)",
    example: 'a3f2e1d8-7c6b-4a5f-9e8d-2b1c4a3f5e6d',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'marie.dupont@youshop.com',
    format: 'email',
  })
  email!: string;

  @ApiPropertyOptional({
    description: "Prénom de l'utilisateur",
    example: 'Marie',
    nullable: true,
  })
  firstName?: string | null;

  @ApiPropertyOptional({
    description: "Nom de famille de l'utilisateur",
    example: 'Dupont',
    nullable: true,
  })
  lastName?: string | null;

  @ApiProperty({
    description: "Rôle de l'utilisateur dans l'application",
    example: 'CLIENT',
    enum: ['CLIENT', 'ADMIN'],
  })
  role!: string;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2025-12-15T09:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour du profil',
    example: '2025-12-30T14:20:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

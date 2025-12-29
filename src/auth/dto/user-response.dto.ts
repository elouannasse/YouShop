import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: "ID unique de l'utilisateur",
    example: 'uuid-123-456-789',
  })
  id!: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'John',
    nullable: true,
  })
  firstName?: string | null;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    example: 'Doe',
    nullable: true,
  })
  lastName?: string | null;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    example: 'CLIENT',
    enum: ['CLIENT', 'ADMIN'],
  })
  role!: string;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2025-12-27T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-12-27T10:00:00.000Z',
  })
  updatedAt!: Date;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: "Token JWT pour l'authentification (valide 7 jours)",
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2YyZTFkOC03YzZiLTRhNWYtOWU4ZC0yYjFjNGEzZjVlNmQiLCJlbWFpbCI6Im1hcmllLmR1cG9udEB5b3VzaG9wLmNvbSIsInJvbGUiOiJDTElFTlQiLCJpYXQiOjE3MzUxMjM0NTYsImV4cCI6MTczNTcyODI1Nn0.XyZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg',
    type: 'string',
  })
  accessToken!: string;

  @ApiProperty({
    description: "Informations complètes de l'utilisateur connecté",
    type: () => UserResponseDto,
    example: {
      id: 'a3f2e1d8-7c6b-4a5f-9e8d-2b1c4a3f5e6d',
      email: 'marie.dupont@youshop.com',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'CLIENT',
      createdAt: '2025-12-15T09:30:00.000Z',
      updatedAt: '2025-12-30T14:20:00.000Z',
    },
  })
  user!: UserResponseDto;
}

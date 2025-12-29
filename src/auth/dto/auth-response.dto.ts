import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: "Token JWT pour l'authentification",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: "Informations de l'utilisateur",
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}

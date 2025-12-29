import { UserResponseDto } from '../dto/user-response.dto';

export interface AuthResponse {
  accessToken: string;
  user: UserResponseDto;
}

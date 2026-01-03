import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces';

/**
 * Stratégie JWT pour l'authentification avec Passport
 * Extrait et valide le token JWT du header Authorization
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Méthode appelée automatiquement par Passport après validation du token
   * @param payload - Payload décodé du JWT
   * @returns Objet user qui sera attaché à request.user
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Token JWT invalide');
    }

    return {
      id: payload.sub, // Utiliser 'id' au lieu de 'userId'
      email: payload.email,
      role: payload.role,
    };
  }
}

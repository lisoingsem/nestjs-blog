import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    // Get user from database to ensure they still exist
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    
    if (!user) {
      return null;
    }

    // Return user object (will be available in req.user)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
} 
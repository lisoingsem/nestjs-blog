import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';

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
    // Find the user by the subject (user id) in the JWT payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    // If user is not found, throw an UnauthorizedException
    if (!user) {
      // Import UnauthorizedException at the top if not already
      throw new (await import('@nestjs/common')).UnauthorizedException('Invalid token: user not found');
    }
    // Optionally, you can return a minimal user object here
    // to avoid leaking sensitive fields
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
} 
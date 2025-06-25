import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      // Don't return password hash
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async logout(userId: number) {
    // For now, just return a success message
    // In a production app, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Invalidate refresh tokens
    
    // Optional: Update user's last logout time
    await this.prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return {
      message: 'Successfully logged out',
      success: true,
    };
  }
}
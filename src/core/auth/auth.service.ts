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

  /**
   * Validate user
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to validate user');
    }
  }

  /**
   * Login user
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
        user,
      }; 
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  /**
   * Logout user
   * 
   * @param userId 
   * @returns 
   */
  async logout(userId: number) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });
  
      return {
        message: 'Successfully logged out',
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to logout');
    }
  }
}
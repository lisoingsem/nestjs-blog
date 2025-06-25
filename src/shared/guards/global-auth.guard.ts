import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await firstValueFrom(this.jwtAuthGuard.canActivate(context) as Observable<boolean>);
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to authenticate');
    }
  }
} 
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the operation is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public, allow access
    if (isPublic) {
      return true;
    }

    // Otherwise, use JWT authentication
    const result = this.jwtAuthGuard.canActivate(context);
    
    // Handle both boolean and Observable<boolean> returns
    if (typeof result === 'boolean') {
      return result;
    }
    
    // Convert Observable to Promise
    return firstValueFrom(result as Observable<boolean>);
  }
} 
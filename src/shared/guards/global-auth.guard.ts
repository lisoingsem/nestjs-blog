import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Use JWT authentication
    const result = this.jwtAuthGuard.canActivate(context);
    
    // Handle both boolean and Observable<boolean> returns
    if (typeof result === 'boolean') {
      return result;
    }
    
    // Convert Observable to Promise
    return firstValueFrom(result as Observable<boolean>);
  }
} 
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getFieldAccessRoles } from '../decorators';

@Injectable()
export class FieldAccessInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;
    const userRoles = user?.role
      ? Array.isArray(user.role)
        ? user.role.map((r: string) => r.toLowerCase())
        : [user.role.toLowerCase()]
      : [];

    return next.handle().pipe(
      map(data => this.filterFieldsByRoles(data, userRoles))
    );
  }

  private filterFieldsByRoles(data: any, userRoles: string[]): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterFieldsByRoles(item, userRoles));
    }

    const result = { ...data };
    const constructor = data.constructor;

    if (constructor && constructor.prototype) {
      const fieldRoles = getFieldAccessRoles(constructor);

      if (fieldRoles && Array.isArray(fieldRoles)) {
        fieldRoles.forEach(fieldRole => {
          if (fieldRole.allowedRoles && !this.hasRequiredRole(userRoles, fieldRole.allowedRoles)) {
            delete result[fieldRole.fieldName];
          }
        });
      }
    }

    return result;
  }

  private hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role.toLowerCase()));
  }
}
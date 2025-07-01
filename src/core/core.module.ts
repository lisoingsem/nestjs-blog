import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { PermissionModule } from './permissions/permission.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PermissionModule,
    AuditModule,
  ],
  exports: [
    AuthModule,
    UserModule,
    PermissionModule,
    AuditModule,
  ],
})
export class CoreModule {} 
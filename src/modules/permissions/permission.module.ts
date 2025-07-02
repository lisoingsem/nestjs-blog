import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PrismaModule } from 'shared/prisma';

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {} 
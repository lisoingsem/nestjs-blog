import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from 'shared/prisma';

@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {} 
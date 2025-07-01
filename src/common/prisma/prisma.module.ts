import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { PrismaHealthService } from './prisma-health.service';
import { PrismaMigrationService } from './prisma-migration.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    PrismaHealthService,
    PrismaMigrationService,
  ],
  exports: [
    PrismaService,
    PrismaHealthService,
    PrismaMigrationService,
  ],
})
export class PrismaModule {} 
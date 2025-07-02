import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { PrismaHealthService } from './prisma-health.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    PrismaHealthService,
  ],
  exports: [
    PrismaService,
    PrismaHealthService,
  ],
})
export class PrismaModule {} 
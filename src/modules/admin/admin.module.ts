import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { PrismaModule } from 'shared/prisma';
import { PermissionsModule } from 'shared/modules/permissions.module';

@Module({
    imports: [PrismaModule, PermissionsModule],
    providers: [AdminService, AdminResolver],
    exports: [AdminService],
})
export class AdminModule { } 
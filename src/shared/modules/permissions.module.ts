import { Module } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { EnhancedPermissionGuard } from '../guards/enhanced-permission.guard';
import { PermissionGuard } from '../guards/permission.guard';

@Module({
    providers: [
        PermissionService,
        EnhancedPermissionGuard,
        PermissionGuard,
    ],
    exports: [
        PermissionService,
        EnhancedPermissionGuard,
        PermissionGuard,
    ],
})
export class PermissionsModule { }
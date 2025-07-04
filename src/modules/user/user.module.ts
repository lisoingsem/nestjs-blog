import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'shared/prisma';
import { UsersResolver } from './user.resolver';
import { PermissionsModule } from 'shared/modules/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UserModule { } 
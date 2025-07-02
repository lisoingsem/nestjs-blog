import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'shared/prisma';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [PrismaModule],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UserModule {} 
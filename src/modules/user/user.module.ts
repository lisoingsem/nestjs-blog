import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRepository } from './user.repository';
import { USER_REPOSITORY_TOKEN } from './user.interface';
import { PrismaModule } from '@common/prisma';

@Module({
  imports: [PrismaModule],
  providers: [
    UserService,
    UserResolver,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}

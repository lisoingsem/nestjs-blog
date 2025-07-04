import { Module } from '@nestjs/common';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { PrismaModule } from 'shared/prisma';
import { PermissionsModule } from 'shared/modules/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  providers: [ProfileResolver, ProfileService],
})
export class ProfileModule { }

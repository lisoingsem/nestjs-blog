import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { PrismaModule } from 'shared/prisma';
import { ContactResolver } from './contact.resolver';
import { PermissionsModule } from 'shared/modules/permissions.module';

@Module({
    imports: [PrismaModule, PermissionsModule],
    providers: [ContactService, ContactResolver],
    exports: [ContactService],
})
export class ContactModule { }

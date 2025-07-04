import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactInput } from './dto/create-contact.input';
import { GetContactListInput } from './dto/get-contact-list.input';
import { ToggleContactFavouriteInput } from './dto/toggle-contact-favourite.input';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from 'shared/guards/permission.guard';
import { HasAnyRoles } from 'shared/decorators/permission.decorator';
import { RoleEnum } from 'shared/contants';

@Resolver()
export class ContactResolver {
    constructor(private readonly contactService: ContactService) { }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @HasAnyRoles(RoleEnum.USER)
    async createNewContact(@Args('input') input: CreateContactInput): Promise<string> {
        const result = await this.contactService.createNewContact(input);
        return result.message;
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @HasAnyRoles(RoleEnum.USER)
    async getMyContactList(@Args('input') input: GetContactListInput): Promise<string> {
        const result = await this.contactService.getMyContactList(input);
        return JSON.stringify(result.contacts);
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @HasAnyRoles(RoleEnum.USER)
    async toggleContactFavourite(@Args('input') input: ToggleContactFavouriteInput): Promise<string> {
        const result = await this.contactService.toggleContactFavourite(input);
        return result.message;
    }
} 
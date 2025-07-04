import { Resolver, Mutation, Args, InputType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from 'shared/guards/permission.guard';
import { HasAnyRoles } from 'shared/decorators/permission.decorator';
import { RoleEnum } from 'shared/contants';

@InputType()
export class UpdateSequenceInput {
    @Field()
    id: string;
    @Field()
    sequence: number;
}

@Resolver()
export class AdminResolver {
    constructor(private readonly adminService: AdminService) { }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @HasAnyRoles(RoleEnum.ADMIN)
    async updateLinkSequences(@Args('params', { type: () => [UpdateSequenceInput] }) params: UpdateSequenceInput[]): Promise<string> {
        const result = await this.adminService.updateLinkSequences(params);
        return result.message;
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @HasAnyRoles(RoleEnum.ADMIN)
    async updateCommunitySequences(@Args('params', { type: () => [UpdateSequenceInput] }) params: UpdateSequenceInput[]): Promise<string> {
        const result = await this.adminService.updateCommunitySequences(params);
        return result.message;
    }
} 
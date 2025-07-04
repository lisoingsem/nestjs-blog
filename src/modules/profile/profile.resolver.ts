import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateUsernameInput } from './dto/create-username.input';
import { UpdateProfileLinksSequencesInput } from './dto/update-profile-links-sequences.input';
import { GenerateBioByAIInput } from './dto/generate-bio-ai.input';
import { GenerateColorCodeFromImageInput } from './dto/generate-color-code-from-image.input';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from 'shared/guards/permission.guard';
import { EnhancedPermissionGuard } from 'shared/guards/enhanced-permission.guard';
import { HasAnyRoles, Public, CurrentUser } from 'shared/decorators/permission.decorator';
import { AllowFields, RestrictFields } from 'shared/decorators/field-permission.decorator';
import { User } from 'shared/services/permission.service';
import { RoleEnum } from 'shared/contants';

@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
  ) { }

  @Query(() => String)
  @Public()
  async profileHealth() {
    return 'Profile OK';
  }

  @Query(() => String)
  @Public()
  @AllowFields('profiles', ['id', 'name', 'username', 'about', 'profileImage', 'coverImage'])
  async getPublicProfile(@Args('username') username: string) {
    const result = await this.profileService.getProfileByUsername(username, 'web', 'browser', 'public');
    return JSON.stringify(result);
  }

  @Query(() => String)
  async myProfile(@CurrentUser() user: User) {
    // User object contains JWT claims for authorization
    console.log('User from token:', {
      id: user.id,
      role: user.role,
      profileId: user.profileId,
      claims: user.userClaims
    });

    const result = await this.profileService.getProfileByUsername(user.id, 'web', 'browser', 'private');
    return JSON.stringify(result);
  }

  @Query(() => String)
  @HasAnyRoles(RoleEnum.ADMIN)
  async allProfiles(@CurrentUser() user: User) {
    console.log('Admin user from token:', user.userClaims);
    return 'Admin access granted - all profiles would be returned here';
  }

  @Query(() => String)
  @HasAnyRoles(RoleEnum.ADMIN)
  async internalProfileStats() {
    return 'Internal stats - hidden from schema';
  }

  @Query(() => String)
  async debugProfileData() {
    return 'Debug data - only visible in development';
  }

  // Internal endpoint - requires authentication
  @Query(() => String)
  async userProfileData() {
    return 'User profile data - requires auth';
  }

  @Mutation(() => String)
  async createUsername(
    @CurrentUser() user: User,
    @Args('input') input: CreateUsernameInput
  ): Promise<string> {
    const result = await this.profileService.createUsername(input);
    return result.message;
  }

  @Mutation(() => String)
  async updateProfileLinksSequences(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileLinksSequencesInput
  ): Promise<string> {
    const result = await this.profileService.updateProfileLinksSequences(input);
    return result.message;
  }

  @Mutation(() => String)
  async generateBioByAI(
    @CurrentUser() user: User,
    @Args('input') input: GenerateBioByAIInput
  ): Promise<string> {
    const result = await this.profileService.generateBioByAI(input);
    return result.message ?? '';
  }

  @Mutation(() => String)
  async generateColorCodeFromImage(
    @CurrentUser() user: User,
    @Args('input') input: GenerateColorCodeFromImageInput
  ): Promise<string> {
    const result = await this.profileService.generateColorCodeFromImage(input);
    return result.message ?? '';
  }

  @Mutation(() => String)
  async insertProfileStatisticLink(
    @CurrentUser() user: User,
    @Args('profileId') profileId: string,
    @Args('platform') platform: string,
    @Args('deviceId') deviceId: string,
    @Args('profileLinkId') profileLinkId: string
  ): Promise<string> {
    // Token must contain user's profile ID for row-level security
    console.log('User profile ID from token:', user.profileId);

    const result = await this.profileService.insertProfileStatisticLink(profileId, platform, deviceId, profileLinkId);
    return result.message;
  }

  @Mutation(() => String)
  async insertProfileStatisticMedia(
    @CurrentUser() user: User,
    @Args('profileId') profileId: string,
    @Args('platform') platform: string,
    @Args('deviceId') deviceId: string,
    @Args('profileMediaId') profileMediaId: string
  ): Promise<string> {
    const result = await this.profileService.insertProfileStatisticMedia(profileId, platform, deviceId, profileMediaId);
    return result.message;
  }

  @Mutation(() => String)
  async insertProfileStatisticCommunity(
    @CurrentUser() user: User,
    @Args('profileId') profileId: string,
    @Args('platform') platform: string,
    @Args('deviceId') deviceId: string,
    @Args('profileCommunityId') profileCommunityId: string
  ): Promise<string> {
    const result = await this.profileService.insertProfileStatisticCommunity(profileId, platform, deviceId, profileCommunityId);
    return result.message;
  }

  @Query(() => String)
  @Public()
  async getProfileByUsername(
    @Args('username') username: string,
    @Args('deviceId') deviceId: string,
    @Args('platform') platform: string,
    @Args('mode') mode: string
  ): Promise<string> {
    const result = await this.profileService.getProfileByUsername(username, deviceId, platform, mode);
    return JSON.stringify(result);
  }

  @Query(() => String)
  @Public()
  async getMetaDataByUsername(@Args('username') username: string): Promise<string> {
    const result = await this.profileService.getMetaDataByUsername(username);
    return JSON.stringify(result);
  }
}

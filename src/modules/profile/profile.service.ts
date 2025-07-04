import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'shared/prisma';
import { CreateUsernameInput } from './dto/create-username.input';
import { UpdateProfileLinksSequencesInput } from './dto/update-profile-links-sequences.input';
import { GenerateBioByAIInput } from './dto/generate-bio-ai.input';
import { GenerateColorCodeFromImageInput } from './dto/generate-color-code-from-image.input';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async createUsername(input: CreateUsernameInput): Promise<{ status: number; message: string }> {
        const { userId, username } = input;
        const usernameRegex = /^(?!^\d+(-|$))[a-z0-9]+(-[a-z0-9]+)*$/;
        if (!usernameRegex.test(username)) throw new BadRequestException('username_is_not_valid');

        // Check if user exists and already has a username
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('user_not_found');
        if (user.username) throw new ConflictException('user_already_has_username');

        // Check if username exists in profiles
        const profileWithUsername = await this.prisma.profile.findFirst({ where: { username } });
        if (profileWithUsername) throw new ConflictException('profile_username_already_exists');

        // Check if username exists in users
        const userWithUsername = await this.prisma.user.findFirst({ where: { username } });
        if (userWithUsername) throw new ConflictException('username_already_exists');

        // Get profile by user_id
        const profile = await this.prisma.profile.findFirst({ where: { user_id: userId } });
        if (!profile) throw new NotFoundException('profile_not_found');

        // Update username in profiles
        await this.prisma.profile.update({ where: { id: profile.id }, data: { username, updated_at: new Date() } });
        // Update username in users
        await this.prisma.user.update({ where: { id: userId }, data: { username, updated_at: new Date() } });

        return { status: 200, message: 'username_updated_successfully' };
    }

    async updateProfileLinksSequences(input: UpdateProfileLinksSequencesInput): Promise<{ status: number; message: string }> {
        const { profileId, params } = input;
        for (const param of params) {
            await this.prisma.profileLink.updateMany({
                where: { id: param.id, profile_id: profileId },
                data: { sequence: param.sequence },
            });
        }
        return { status: 200, message: 'profile_links_sequences_updated_successfully' };
    }

    async generateBioByAI(input: GenerateBioByAIInput): Promise<{ status: number; message?: string; aiBio?: string; aiCredit?: number }> {
        const { profileId, rawBio, type, length, platform, deviceId } = input;
        // TODO: Integrate with Cohere or OpenAI API for bio generation
        // For now, stub the AI response
        const aiBio = `Generated bio for: ${rawBio}`;
        const GENERATE_AI_BIO_CREDIT = 1;
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Get profile and check ai_credit
                const profile = await tx.profile.findUnique({ where: { id: profileId } });
                if (!profile) throw new NotFoundException('profile_not_found');
                if ((profile.ai_credit ?? 0) < GENERATE_AI_BIO_CREDIT) throw new BadRequestException('ai_credit_not_enough');
                // 2. Deduct ai_credit
                const aiCredit = (profile.ai_credit ?? 0) - GENERATE_AI_BIO_CREDIT;
                await tx.profile.update({ where: { id: profileId }, data: { ai_credit: aiCredit } });
                // 3. Insert transaction log
                await tx.transactionLog.create({
                    data: {
                        profile_id: profileId,
                        device_id: deviceId ?? null,
                        platform: platform ?? null,
                        status: 'success',
                        type: 'ai',
                        remark: 'generate_bio',
                        amount: GENERATE_AI_BIO_CREDIT,
                        total_amount: aiCredit,
                    },
                });
                // 4. Return response
                return { status: 200, aiBio, aiCredit };
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            return { status: 500, message: (error as Error).message || 'internal_server_error' };
        }
    }

    async generateColorCodeFromImage(input: GenerateColorCodeFromImageInput): Promise<{ status: number; message?: string; aiCredit?: number }> {
        const { profileId, deviceId, platform } = input;
        // TODO: Integrate with image color extraction AI/model
        const GENERATE_COLOR_CODE_FROM_IMAGE_CREDIT = 1;
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Get profile and check ai_credit
                const profile = await tx.profile.findUnique({ where: { id: profileId } });
                if (!profile) throw new NotFoundException('profile_not_found');
                if ((profile.ai_credit ?? 0) < GENERATE_COLOR_CODE_FROM_IMAGE_CREDIT) throw new BadRequestException('ai_credit_not_enough');
                // 2. Deduct ai_credit
                const aiCredit = (profile.ai_credit ?? 0) - GENERATE_COLOR_CODE_FROM_IMAGE_CREDIT;
                await tx.profile.update({ where: { id: profileId }, data: { ai_credit: aiCredit } });
                // 3. Insert transaction log
                await tx.transactionLog.create({
                    data: {
                        profile_id: profileId,
                        device_id: deviceId ?? null,
                        platform: platform ?? null,
                        status: 'success',
                        type: 'ai',
                        remark: 'generate_color_code_from_image',
                        amount: GENERATE_COLOR_CODE_FROM_IMAGE_CREDIT,
                        total_amount: aiCredit,
                    },
                });
                // 4. Return response
                return { status: 200, aiCredit };
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            return { status: 500, message: (error as Error).message || 'internal_server_error' };
        }
    }

    async insertProfileStatisticLink(profileId: string, platform: string, deviceId: string, profileLinkId: string): Promise<{ status: number; message: string }> {
        // Check if the link exists
        const link = await this.prisma.profileLink.findFirst({ where: { id: profileLinkId, profile_id: profileId } });
        if (!link) return { status: 404, message: 'link_not_found' };
        // Insert statistic
        await this.prisma.profileStatistic.create({ data: { profile_id: profileId, platform, device_id: deviceId, entity_id: profileLinkId, entity_name: 'profile_links' } });
        return { status: 200, message: 'profile_statistic_link_inserted_successfully' };
    }

    async insertProfileStatisticMedia(profileId: string, platform: string, deviceId: string, profileMediaId: string): Promise<{ status: number; message: string }> {
        // Check if the media exists
        const media = await this.prisma.profileMedia.findFirst({ where: { id: profileMediaId, profile_id: profileId } });
        if (!media) return { status: 404, message: 'media_not_found' };
        // Insert statistic
        await this.prisma.profileStatistic.create({ data: { profile_id: profileId, platform, device_id: deviceId, entity_id: profileMediaId, entity_name: 'profile_medias' } });
        return { status: 200, message: 'profile_statistic_media_inserted_successfully' };
    }

    async insertProfileStatisticCommunity(profileId: string, platform: string, deviceId: string, profileCommunityId: string): Promise<{ status: number; message: string }> {
        // Check if the community exists
        const community = await this.prisma.profileCommunity.findFirst({ where: { id: profileCommunityId, profile_id: profileId } });
        if (!community) return { status: 404, message: 'community_not_found' };
        // Insert statistic
        await this.prisma.profileStatistic.create({ data: { profile_id: profileId, platform, device_id: deviceId, entity_id: profileCommunityId, entity_name: 'profile_communities' } });
        return { status: 200, message: 'profile_statistic_community_inserted_successfully' };
    }

    async getProfileByUsername(username: string, deviceId: string, platform: string, mode: string): Promise<{ status: number; message: string; profileId: string | null; bearerToken?: string; profileName?: string; profileAbout?: string; profileImage?: string; mode?: string }> {
        // Find user by username
        const user = await this.prisma.user.findFirst({ where: { username } });
        if (!user) return { status: 404, message: 'user_not_found', profileId: null };
        // Find profile by user id
        const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id } });
        if (!profile) return { status: 404, message: 'profile_not_found', profileId: null };
        // Use profile.profile_image or profile.image, whichever exists
        const profileImage = (profile as any).image ?? (profile as any).profile_image ?? undefined;
        return {
            status: 200,
            message: 'success',
            profileId: profile.id ?? undefined,
            profileName: profile.name ?? undefined,
            profileAbout: profile.about ?? undefined,
            profileImage,
            mode,
        };
    }

    async getMetaDataByUsername(username: string): Promise<{ status: number; message: string; metaData: { profileName: string; profileAbout: string; profileImage: string } | null }> {
        // Find user by username
        const user = await this.prisma.user.findFirst({ where: { username } });
        if (!user) return { status: 404, message: 'user_not_found', metaData: null };
        // Find profile by user id
        const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id } });
        if (!profile) return { status: 404, message: 'profile_not_found', metaData: null };
        const profileImage = (profile as any).image ?? (profile as any).profile_image ?? '';
        return {
            status: 200,
            message: 'success',
            metaData: {
                profileName: profile.name ?? '',
                profileAbout: profile.about ?? '',
                profileImage,
            },
        };
    }
}

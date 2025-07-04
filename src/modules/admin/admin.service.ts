import { Injectable } from '@nestjs/common';
import { PrismaService } from 'shared/prisma';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async updateLinkSequences(params: { id: string; sequence: number }[]): Promise<{ status: number; message: string }> {
        for (const param of params) {
            await this.prisma.link.update({ where: { id: param.id }, data: { sequence: param.sequence } });
        }
        return { status: 200, message: 'links_sequences_updated_successfully' };
    }

    async updateCommunitySequences(params: { id: string; sequence: number }[]): Promise<{ status: number; message: string }> {
        for (const param of params) {
            await this.prisma.community.update({ where: { id: param.id }, data: { sequence: param.sequence } });
        }
        return { status: 200, message: 'communities_sequences_updated_successfully' };
    }
} 
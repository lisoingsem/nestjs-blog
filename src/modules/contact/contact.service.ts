import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'shared/prisma';
import { CreateContactInput } from './dto/create-contact.input';
import { GetContactListInput } from './dto/get-contact-list.input';
import { ToggleContactFavouriteInput } from './dto/toggle-contact-favourite.input';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async createNewContact(input: CreateContactInput): Promise<{ status: number; message: string; contact?: string }> {
        const { profileId, username, remark } = input;
        // Find the contact profile by username
        const contactProfile = await this.prisma.profile.findFirst({ where: { username } });
        if (!contactProfile) throw new NotFoundException('contact_profile_not_found');
        // Check if contact already exists
        const existing = await this.prisma.contact.findFirst({ where: { profile_id: profileId, connector_id: contactProfile.id } });
        if (existing) throw new ConflictException('contact_already_exists');
        // Create contact
        const contact = await this.prisma.contact.create({
            data: {
                profile_id: profileId,
                connector_id: contactProfile.id,
                remark,
            },
        });
        return { status: 200, message: 'contact_created', contact: contact.id };
    }

    async getMyContactList(input: GetContactListInput): Promise<{ status: number; message?: string; contacts?: any[]; total?: number }> {
        const { profileId, limit, offset, orderBy, searchName } = input;
        const where: any = { profile_id: profileId };
        if (searchName) {
            where.remark = { contains: searchName, mode: 'insensitive' };
        }
        const [contacts, total] = await this.prisma.$transaction([
            this.prisma.contact.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: orderBy ? { remark: orderBy as any } : undefined,
            }),
            this.prisma.contact.count({ where }),
        ]);
        return { status: 200, contacts, total };
    }

    async toggleContactFavourite(input: ToggleContactFavouriteInput): Promise<{ status: number; message: string }> {
        const { profileId, contactId, favourite } = input;
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId, profile_id: profileId } });
        if (!contact) throw new NotFoundException('contact_not_found');
        await this.prisma.contact.update({ where: { id: contactId }, data: { favourite } });
        return { status: 200, message: 'contact_favourite_updated' };
    }
} 
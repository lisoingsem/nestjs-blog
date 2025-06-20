import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    return this.prisma.user.create({
      data: createUserInput,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ include: { posts: true } });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { posts: true } });
  }
}

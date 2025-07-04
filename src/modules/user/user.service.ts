import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput } from './dto';
import { PrismaService } from 'shared/prisma';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ) { }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { status: 'active' }
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: createUserInput.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserInput,
        password: hashedPassword,
      }
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    await this.findOne(id);

    if (updateUserInput.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: updateUserInput.email }
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken');
      }
    }

    // Hash password if provided
    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserInput
    });
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { status: 'inactive' }
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email }
    });
  }
} 
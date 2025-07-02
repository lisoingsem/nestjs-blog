import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput } from './dto';
import { PrismaService } from 'shared/prisma';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ) {}

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null }
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
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

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    await this.findOne(id);

    if (updateUserInput.email) {
      const existingUser = await this.prisma.user.findUnique({
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

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }
} 
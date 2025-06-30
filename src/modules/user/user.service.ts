import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // find all users
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({});

    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  // find one user
  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async create(createUserDto: any): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const { password, ...result } = user;
    return result;
  }

  async restore(id: number): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    const { password, ...result } = user;
    return result;
  }
}

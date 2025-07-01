import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // find all users
  async findAll() {
    const users = await this.prisma.user.findMany({});
    return users.map(user => {
      const { password, ...result } = user;
      return {
        ...result,
        deletedAt: result.deletedAt || undefined,
      };
    });
  }

  // find one user
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...result } = user;
    return {
      ...result,
      deletedAt: result.deletedAt || undefined,
    };
  }

  async create(createUserDto: any) {
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
    return {
      ...result,
      deletedAt: result.deletedAt || undefined,
    };
  }

  async update(id: number, updateUserDto: any) {
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = user;
    return {
      ...result,
      deletedAt: result.deletedAt || undefined,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const { password, ...result } = user;
    return {
      ...result,
      deletedAt: result.deletedAt || undefined,
    };
  }

  async restore(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    const { password, ...result } = user;
    return {
      ...result,
      deletedAt: result.deletedAt || undefined,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
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
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  // find one user
  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserInput.email },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        name: createUserInput.name,
        email: createUserInput.email,
        password: hashedPassword,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(data: UpdateUserInput) {
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    return this.prisma.user.update({
      where: { id: data.id },
      data: { ...data },
    });
  }

  async delete(id: number): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async restore(id: number): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}

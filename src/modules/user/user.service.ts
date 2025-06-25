import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { EditUser } from './dto/edit';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // find all users
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });

    // Don't return passwords in response
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

    if (!user || user.deletedAt) {
      return null;
    }

    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async register(data: { email: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      throw new Error('User already exists');
    }
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        name: createUserInput.name,
        email: createUserInput.email,
        password: hashedPassword,
      },
    });

    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(data: EditUser) {
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    return this.prisma.user.update({
      where: { id: data.id },
      data: { ...data },
    });
  }

  async softDelete(id: number): Promise<User | null> {
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { EditUser } from './dto/edit';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // find all users
  async findAll() {
    return this.prisma.user.findMany();
  }

  // find one user
  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
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

  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserInput,
        password: hashedPassword,
      },
    });
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
}

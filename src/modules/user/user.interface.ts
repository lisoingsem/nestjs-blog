import { User } from '@prisma/client';

export interface UserInterface {
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findActive(): Promise<User[]>;
  create(data: any): Promise<User>;
  update(id: number, data: any): Promise<User>;
  delete(id: number): Promise<void>;
  softDelete(id: number): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

// Token for dependency injection
export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';
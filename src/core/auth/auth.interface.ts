import { User } from '@prisma/client';

export interface AuthRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: any): Promise<User>;
  update(id: number, data: any): Promise<User>;
  delete(id: number): Promise<void>;
}

// Token for dependency injection
export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY'; 
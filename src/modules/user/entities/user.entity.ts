export class User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // Do not expose password in GraphQL
  password?: string;
} 
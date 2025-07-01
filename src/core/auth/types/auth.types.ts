export interface JwtPayload {
  email: string;
  sub: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
} 
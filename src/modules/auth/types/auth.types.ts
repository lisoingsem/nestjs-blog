export interface JwtPayload {
  email: string;
  sub: number;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenResponse {
  access_token: string;
} 
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'file:./dev.db',
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || 'file:./shadow.db',
}));
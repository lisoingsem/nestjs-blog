import { ConfigService } from '@nestjs/config';

export const getAppleConfig = (configService: ConfigService) => ({
  TEAM_ID: configService.get('APPLE_TEAM_ID'),
  KEY_ID: configService.get('APPLE_KEY_ID'),
  CLIENT_ID: configService.get('APPLE_CLIENT_ID'),
  PRIVATE_KEY: configService.get('APPLE_PRIVATE_KEY'),
  ISSUER: 'https://appleid.apple.com',
  JWKS_URI: 'https://appleid.apple.com/auth/keys',
});
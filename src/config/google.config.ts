import { ConfigService } from '@nestjs/config';

export const getGoogleConfig = (configService: ConfigService) => ({
  CLIENT_ID: configService.get('GOOGLE_CLIENT_ID'),
  CLIENT_ID_IOS: configService.get('GOOGLE_CLIENT_ID_IOS'),
  CLIENT_ID_ANDROID: configService.get('GOOGLE_CLIENT_ID_ANDROID'),
});
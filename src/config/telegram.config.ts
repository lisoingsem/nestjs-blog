import { ConfigService } from '@nestjs/config';

export const getTelegramConfig = (configService: ConfigService) => ({
  TELEGRAM_BOT_TOKEN: configService.get('TELEGRAM_BOT_TOKEN'),
});
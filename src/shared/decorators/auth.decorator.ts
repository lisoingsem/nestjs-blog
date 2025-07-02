import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard as JwtAuthGuardClass } from 'shared/guards';

export function JwtAuthGuard() {
  return UseGuards(JwtAuthGuardClass);
} 
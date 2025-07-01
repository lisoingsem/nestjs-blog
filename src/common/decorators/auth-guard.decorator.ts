import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard as JwtAuthGuardClass } from '@common/guards/jwt.guard';

export function JwtAuthGuard() {
  return UseGuards(JwtAuthGuardClass);
} 
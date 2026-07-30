import { Module } from '@nestjs/common';
import { GruposUrlController } from './grupos-url.controller';
import { GruposUrlService } from './grupos-url.service';
import { GruposUrlRepository } from './grupos-url.repository';

@Module({
  controllers: [GruposUrlController],
  providers: [GruposUrlService, GruposUrlRepository],
  exports: [GruposUrlService],
})
export class GruposUrlModule {}

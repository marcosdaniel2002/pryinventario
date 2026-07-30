import { Module } from '@nestjs/common';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { UrlsRepository } from './urls.repository';

@Module({
  controllers: [UrlsController],
  providers: [UrlsService, UrlsRepository],
  exports: [UrlsService],
})
export class UrlsModule {}

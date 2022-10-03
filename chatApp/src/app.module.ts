import { Module } from '@nestjs/common';
import { ChannelEventHandler } from './ChannelEventHandler';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [ChannelEventHandler],
  providers: [AppService],
})
export class AppModule {}

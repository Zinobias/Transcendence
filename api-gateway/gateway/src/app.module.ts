import { Module } from '@nestjs/common';
import { ApiGateway } from './api.gateway';
import { ChatGateway } from './chat.gateway';
import { GameGateway } from './game.gateway';
import { AuthGateway } from './auth.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ApiGateway, ChatGateway, GameGateway, AuthGateway],
})
export class AppModule {}

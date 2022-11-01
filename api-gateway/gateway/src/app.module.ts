import { Module } from '@nestjs/common';
import { ApiGateway, Sockets } from './api.gateway';
import { ChatGateway } from './chat.gateway';
import { GameGateway } from './game.gateway';
import { AuthGateway } from './auth.gateway';
import { ApiController } from './api/api.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    ClientsModule.register([
    { 
      name: 'GAME_SERVICE', 
      transport: Transport.TCP,
      options : {
          host: 'game-app',
          port: 3000,
    },
  },{ 
    name: 'CHAT_SERVICE', 
    transport: Transport.TCP,
    options : {
        host: 'chat-app',
        port: 3000,
  },
},
]),
    
  ],
  controllers: [ApiController],
  providers: [ApiGateway, ChatGateway, GameGateway, AuthGateway, Sockets],
})
export class AppModule {}

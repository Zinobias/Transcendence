import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { WebSocketServer } from '@nestjs/websockets';
import { Sockets } from 'src/sockets.class';
//import { Server } from 'http';

export interface microServiceDTO {
  eventPattern: string;
  userIDs: number[];
  data: any;
}

@Controller()
export class ApiController {
  //@WebSocketServer()
  //server : Server;
  private logger = new Logger('gateway api controller');

  constructor(
    @Inject(Sockets) private readonly sockets: Sockets,
    @Inject('GAME_SERVICE') private game_client: ClientProxy,
    @Inject('CHAT_SERVICE') private chat_client: ClientProxy,
  ) {}

  @EventPattern('game')
  gameForwarding(@Payload() payload: microServiceDTO) {
    this.logger.log('Msg from game to gateway received');
    this.sockets.sendData(
      payload.userIDs,
      payload.eventPattern,
      payload.data,
    );
  }

  @EventPattern('testMsg')
  testingFnc(@Payload() payload: any) {
    this.logger.log('Msg from game to gateway received : ' + payload);
  }

  @EventPattern('chat')
  chatForwarding(@Payload() payload: microServiceDTO) {
    // change any to interface
	  this.logger.debug(`api chat ${payload.eventPattern}`);
    for (const userid of payload.userIDs) {
      this.logger.debug(`${userid} ${payload.eventPattern} and ${this.sockets.getSocket(userid)}`);
      this.sockets
        .getSocket(userid)
        ?.emit(payload.eventPattern, payload.data);
    }
  }
}

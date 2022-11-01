import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { WebSocketServer } from '@nestjs/websockets';
import { Sockets } from 'src/sockets.class';
//import { Server } from 'http';

export interface microServiceDTO {
	eventPattern : string,
	userIDs: number[],
	payload : {},
}

@Controller('api')
export class ApiController {
	//@WebSocketServer()
	//server : Server;

	constructor(@Inject(Sockets) private readonly sockets : Sockets,
				@Inject('GAME_SERVICE') private game_client: ClientProxy,
				@Inject('CHAT_SERVICE') private chat_client: ClientProxy) {}

	@EventPattern('game')
	gameForwarding(@Payload() payload : microServiceDTO ) {
		for (let userid of payload.userIDs) {
			this.sockets.getSocket(userid)?.emit(payload.eventPattern, payload.payload);
		}
	}

	@EventPattern('chat')
	chatForwarding(@Payload() payload : microServiceDTO ) { // change any to interface
		for (let userid of payload.userIDs) {
			this.sockets.getSocket(userid)?.emit(payload.eventPattern, payload.payload);
		}
	}
}

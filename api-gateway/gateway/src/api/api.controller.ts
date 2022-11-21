import {Controller, Inject, Logger} from '@nestjs/common';
import {EventPattern, Payload, ClientProxy} from '@nestjs/microservices';
import {WebSocketServer} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {Sockets} from 'src/sockets.class';

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
    private logger = new Logger('ApiController');

    constructor(
        @Inject(Sockets) private readonly sockets: Sockets,
        @Inject('GAME_SERVICE') private game_client: ClientProxy,
        @Inject('CHAT_SERVICE') private chat_client: ClientProxy,
    ) {
    }

    @EventPattern('game')
    gameForwarding(@Payload() payload: microServiceDTO) {
        this.logger.log(`Msg from game to gateway received`);
		for (const userid of payload.userIDs) {
			this.sockets
				.getSocket(userid)
				?.emit(payload.eventPattern, payload.data);
		}
    }

    @EventPattern('testMsg')
    testingFnc(@Payload() payload: any) {
        this.logger.log(`Msg from game to gateway received : [${payload}]`);
    }

    @EventPattern('chat')
    chatForwarding(@Payload() payload: microServiceDTO) {
        this.logger.log(`Msg from chat to gateway received`);
		for (const userid of payload.userIDs) {
			this.sockets
				.getSocket(userid)
				?.emit(payload.eventPattern, payload.data);
		}
    }

    @EventPattern('chat_to_game')
    chatToGame(@Payload() payload: microServiceDTO) {
        this.game_client.emit(payload.eventPattern, payload.data);
    }

    @EventPattern('game_to_chat')
    gameToChat(@Payload() payload: microServiceDTO) {
        this.game_client.emit(payload.eventPattern, payload.data);
    }

}

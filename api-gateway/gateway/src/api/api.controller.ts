import {Controller, Inject, Logger} from '@nestjs/common';
import {EventPattern, Payload, ClientProxy} from '@nestjs/microservices';
import {Sockets} from 'src/sockets.class';

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
    gameForwarding(@Payload() payload: any) {
		this.sockets.sendData(payload.userIds, payload.eventPattern, payload.data);
    }

    @EventPattern('testMsg')
    testingFnc(@Payload() payload: any) {
        // this.logger.log(`Msg from game to gateway received : [${payload}]`);
    }

    @EventPattern('chat')
    chatForwarding(@Payload() payload: microServiceDTO) {
        // this.logger.log(`Msg from chat to gateway received`);
		this.sockets.sendData(payload.userIDs, payload.eventPattern, payload.data);

		// for (const userid of payload.userIDs) {
		// 	let socket = this.sockets.getSocket(userid);
        //     if (socket === undefined) {
        //         this.logger.debug(`Tried to emit to offline user`);
        //     } else {
        //         this.logger.debug(`Emitting to ${socket.id} on ${payload.eventPattern}`);
        //         socket.emit(payload.eventPattern, payload.data);
        //     }
		// }
    }

    @EventPattern('chat_to_game')
    chatToGame(@Payload() payload: microServiceDTO) {
        this.logger.log("chat_to_game gatway event");
        this.game_client.emit('internal.game.create', payload);
    }

    @EventPattern('game_to_chat')
    gameToChat(@Payload() payload: microServiceDTO) {
        this.game_client.emit(payload.eventPattern, payload);
    }

}

import {Inject, Logger, UseGuards} from '@nestjs/common';
import {ClientProxy, MessagePattern} from '@nestjs/microservices';
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io';
import {Sockets} from './sockets.class';
import {Auth} from './auth.service';
import {AuthGuard} from './auth.guard';
import {CreateAccountDTO, LoginDTO} from './api.gateway.DTOs';

export interface FrontEndDTO {
    userId?: number;
    authToken?: string;
    eventPattern: string;
    data: any;
}

@WebSocketGateway(8084, {
    cors: {
        origin: '*',
    },
    //path: '/', // can look into path
    //serveClient: true,
    //namespace: '/',
})
export class ApiGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;
    private logger: Logger = new Logger('ApiGateway');

    async onApplicationBootstrap() {
        this.logger.log(`Starting bootstrap gateway...`);
        // this.gameClient.connect();
        this.gameClient.emit('testMsg', 'msg from frontend');
        this.chatClient.emit('testMsg', 'msg from frontend');
		this.gameClient.emit('game.create', {
			player1UID 	: "123",
			player2UID 	: "234",
			gameMode	: 'default'
		});
    }

    //private clientList: { userID: number };

    constructor(
        @Inject(Sockets)
        private readonly sockets: Sockets,
        @Inject('GAME_SERVICE') private gameClient: ClientProxy,
        @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
        @Inject(Auth) private auth: Auth,
    ) {
    }

    afterInit(server: Server) {
        this.logger.log(`Initialized gateway`);
    }

    // TODO: make sure it is storing the userID
    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id} ${args[0]}`);
        // this.sockets.storeSocket(args[0] as number, client); /*This shouldn't be needed as auth handles that*/
        client.emit('wssTest', {message: 'Connected to the websocketServer'}); // relays back to frontend
        this.gameClient.send('testMsg', {message: 'random message from gateway'}); // to game
        this.gameClient.emit('testMsg', 'user connected to frontend');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // @UseGuards(AuthGuard)
    @SubscribeMessage('chat')
    handleChat(client: Socket, @MessageBody() payload: FrontEndDTO) {
        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        if (payload.userId !== undefined && payload.userId !== payload.data.userId) {
            Logger.warn(`Received invalid payload from ${payload.userId}, the user id in the payload was set to ${payload.data.userId}!`)
            return;
        }
        this.chatClient.emit(payload.eventPattern, payload.data);
    }

    //@UseGuards(AuthGuard)
    @SubscribeMessage('game')
    handleGame(client: Socket, @MessageBody() payload: FrontEndDTO) {
        //TODO verify auth
        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        this.logger.debug(`auth works ${payload}`);
        if (payload.eventPattern === 'game.player.move') {
            if (payload.userId === undefined || payload.userId !== payload.data.userId)
                return;
        }
        this.gameClient.emit(payload.eventPattern, payload.data);
    }

    //   @SubscribeMessage('auth')
    //     async handleAuth(client: Socket, payload: any) {
    //     this.logger.debug("auth event " + payload.code);
    //     await this.auth.auth(client, payload);
    //   }

    @SubscribeMessage('auth')
    async handleAuthResp(
        client: Socket,
        payload: FrontEndDTO,
    ): Promise<boolean | any> {
        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        if (payload.eventPattern === 'login') {
            const loginDTO: LoginDTO | undefined = await this.auth.login(client, payload.data.token);

            return {
                event: 'login',
                data: loginDTO === undefined ? false : loginDTO,
            };

        } else if (payload.eventPattern === 'validate')
            return {
                event: 'valiate',
                data: this.auth.validate(payload.userId, payload.authToken),
            };

        else if (payload.eventPattern === 'create_account') {
            const createAccountDTO: CreateAccountDTO | undefined = await this.auth.createAccount(
                client,
                payload.data,
            );

            if (createAccountDTO === undefined) {
                this.logger.debug(`Received undefined createAccountDTO from payload data: [${payload.data}]`);
                return ({event: 'create_account', data: false});
            }
            this.logger.debug(`Creating account for [${createAccountDTO.user_id}] with cookie [${createAccountDTO.auth_cookie}]`);
            return {
                event: 'create_account',
                data: createAccountDTO,
            };
        }
        this.logger.debug(`Received invalid pattern on auth channel, Auth token: [${payload.data.token}], Event pattern: [${payload.eventPattern}]`);
        return false;
    }

    /**
     * auth routes
     * route 1 : Login.
     * {
     * 	userId? : number,
     * 	token? : string,
     * 	eventPattern : login
     * 	payload: { token : accessToken },
     * }
     * return (app accessToken);
     * route 2 : validating token w/ userId.
     *  {
     * 	userId? : number,
     * 	token? : string,
     * 	eventPattern : Validate
     * 	payload: {},
     * }
     * return (boolean);
     *
     * route 3 : Create account.
     *  {
     * 	userId? : number,
     * 	token? : string,
     * 	eventPattern : Validate
     * 	payload: {
     * 		token : accessToken,
     * 		userName : string,
     * },
     * }
     * return (accessToken);
     */

    // export interface FrontEndDTO {
    // 	userId?: number;
    // 	token?: string;
    // 	eventPattern: string;
    // 	payload: {};
    //   }
}

import {Inject, Logger, UseGuards} from '@nestjs/common';
import {ClientProxy, MessagePattern, Payload} from '@nestjs/microservices';
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
import { twoFactorAuthService } from './2fa.service';

// TODO : replace frontendDTO from gateway, use the one in api.gateway.DTOS.ts
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
		@Inject(twoFactorAuthService) private TFA : twoFactorAuthService,
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

    @UseGuards(AuthGuard)
    @SubscribeMessage('chat')
    handleChat(client: Socket, @MessageBody() payload: FrontEndDTO) {
        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        if (payload.data.user_id !== undefined && payload.userId !== payload.data.user_id) {
            this.logger.warn(`Received invalid payload from ${payload.userId}, the user id in the payload was set to ${payload.data.userId}!`)
            return;
        }
        this.chatClient.emit(payload.eventPattern, payload.data);
    }

    @UseGuards(AuthGuard)
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
    async handleAuthResp(client: Socket, payload: FrontEndDTO): Promise<boolean | any> {
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

    @SubscribeMessage('retrieve_redirect')
    async handleRetrieveRedirect(client: Socket, payload: FrontEndDTO): Promise<any> {
        return {
            event: 'retrieve_redirect',
            data: {
                login: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT}&redirect_uri=http%3A%2F%2F${process.env.WEB_HOST}%3A${process.env.WEB_PORT}%2Flogin&response_type=code`,
                signup: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT}&redirect_uri=http%3A%2F%2F${process.env.WEB_HOST}%3A${process.env.WEB_PORT}%2Fsignup&response_type=code`
            }
        }
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('enable_2fa') 
	async enableTwoFactorAuthentication(client : Socket, payload : FrontEndDTO) {
		if (!payload.userId) // might not be neccessary due to authguard
		return ({
			event : 'enable_2fa',
			data : {
				success : false,
				msg 	: 'enabling 2fa failed, invalid userId : undefined'
			}
		});
		// CHECK IF ALREADY IN DB, IF IN DB, RETURN FAILED.
		this.logger.log(`user [${payload.userId}] calling enable 2fa`);
		let qrCode : string | undefined = await this.TFA.generateSecret(payload.userId);
		let success : boolean = qrCode === undefined;
		return ({event : 'enable_2fa', data : {
			success : 	success,
			msg		: 	success === true ? 'enabling 2fa succeeded' : 'enabling 2fa failed.',
			qrCode 	:	qrCode,
		}});
	}

    @UseGuards(AuthGuard)
    @SubscribeMessage('verify_2fa') 
	async verifyTFA(client : Socket, payload : FrontEndDTO) {
		let success : boolean = false;

		
		if (!payload.userId)
		return ({
			event : 'verify_2fa',
			data : {
				success : success,
				msg 	: 'enabling 2fa failed, invalid userId : undefined'
			}
		});
		this.logger.log(`user [${payload.userId}] calling verify_2fa`);
		if (!payload.data.TFAtoken)
			success = false;
		else
			success = await this.TFA.verify(payload.userId, payload.data.TFAtoken);
		return ({
			event : 'verify_2fa', 
			data : {
				success : success,
				msg		: success === true ? 'verifying 2fa succeeded' : 'verifying 2fa failed.',
			}
		});
		};

	@UseGuards(AuthGuard)
	@SubscribeMessage('isEnabled_2fa') 
	async hasTFA(client : Socket, payload : FrontEndDTO) {
		let success : boolean = false;

		if (payload.userId)
		success = await this.TFA.hasTwoFA(payload.userId);
		this.logger.log(`user [${payload.userId}] calling isEnabled2fa`);
		return ({
			event : 'isEnabled_2fa',
			data : {
				 success 	: success,
				 msg		: success === true ? `2fa is enabled for user ${payload.userId}` : `2fa is disabled for user ${payload.userId}`,
		}
		});
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

import {Inject, Logger, UseGuards} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {Sockets} from './sockets.class';
import {Auth} from './auth.service';
import {AuthGuard} from './auth.guard';
import {CreateAccountDTO, LoginDTO} from './api.gateway.DTOs';
import {TwoFactorAuthService} from './2fa.service';
import {Has2FA, Queries} from "./database/queries";

// TODO : replace frontendDTO from gateway, use the one in api.gateway.DTOS.ts
export interface FrontEndDTO {
    userId?: number;
    authToken?: string;
    eventPattern: string;
    data: any;
}

interface Online {
	userId: number;
	checkIds: number[];
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
        this.gameClient.emit('testMsg', 'msg from frontend');
        this.chatClient.emit('testMsg', 'msg from frontend');
    }

    //private clientList: { userID: number };

    constructor(
        @Inject(Sockets)
        private readonly sockets: Sockets,
        @Inject('GAME_SERVICE') private gameClient: ClientProxy,
        @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
        @Inject(Auth) private auth: Auth,
		@Inject(TwoFactorAuthService) private TFA : TwoFactorAuthService,
        @Inject(Queries) private readonly queries: Queries,
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
		this.sockets.removeSocket(client);
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('chat')
    handleChat(client: Socket, payload: FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);

        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        if (payload.data.user_id !== undefined && payload.userId !== payload.data.user_id) {
            this.logger.warn(`Received invalid payload from ${payload.userId}, the user id in the payload was set to ${payload.data.userId}!`)
            return;
        }
        // this.logger.debug(`Received event from frontend on ${payload.eventPattern}`)
        this.chatClient.emit(payload.eventPattern, payload.data);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('game')
    handleGame(client: Socket, payload: FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);

        //TODO verify auth
        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        // this.logger.debug(`auth works ${payload}`);
        if (payload.eventPattern == 'game.player.move') {
            if (payload.userId === undefined || payload.userId != payload.data.userId)
                return;
        }
        this.gameClient.emit(payload.eventPattern, payload.data);
    }

    //   @SubscribeMessage('auth')
    //     async handleAuth(client: Socket, payload: any) {
    //     this.logger.debug("auth event " + payload.code);
    //     await this.auth.auth(client, payload);
    //   }

	@UseGuards(AuthGuard)
	@SubscribeMessage('check_online')
	async handleCheckOnline(client: Socket, payload: any) {
		const online: number[] = []
		const offline: number[] = []
		// this.logger.debug("event check_online " + payload.data.checkIds);
		for (let i = 0; i < payload.data.checkIds?.length; i++) {
			const socketList: Socket[] | undefined = this.sockets.getSocket(payload.data.checkIds[i]);
			if (socketList != undefined && socketList.length != 0) {
				online.push(payload.data.checkIds[i])
			} else {
				offline.push(payload.data.checkIds[i])
			}
		}
		// client.emit('check_online', {
		// 	onlineUsers: online,
		// 	offlineUsers: offline
		// });
		return {
			event: `check_online`,
			data: {
				onlineUsers: online,
				offlineUsers: offline
			}
		}
	}

    @SubscribeMessage('auth')
    async handleAuthResp(client: Socket, payload: FrontEndDTO): Promise<boolean | any> {
		this.sockets.storeSocket(payload.userId!, client);

        if (payload.eventPattern.toLocaleLowerCase().startsWith('internal')) //TODO Move to auth guard
            return;
        if (payload.eventPattern === 'login') {
            const loginDTO: LoginDTO | undefined = await this.auth.login(client, payload.data.token, payload.data.TFAToken ?? undefined);
            return {
                event: 'login',
                data: { 
					DTO : loginDTO,
					success : loginDTO === undefined ? false : true,
					msg : loginDTO === undefined ? `Login went wrong` : `Login went well`,
				},
            };
        } else if (payload.eventPattern === 'validate')
            return {
                event: 'validate',
                data: {
					DTO		: this.auth.validate(payload.userId, payload.authToken),
					success : true,
					msg 	: 'validating',
				},
            };

        else if (payload.eventPattern === 'create_account') {
            const err: boolean | string = await this.queries.userNameExists(payload.data.userName);
            if (err != false) {
                return ({
                    event: 'create_account', data: {
                        success: false,
                        msg: err as string
                    }
                });
            }
            const createAccountDTO: CreateAccountDTO | string = await this.auth.createAccount(
                client,
                payload.data,
            );
            if (typeof createAccountDTO == 'string') {
                this.logger.debug(`msg: ${createAccountDTO as string}`)
                return ({
                    event: 'create_account', data: {
                        success: false,
                        msg: createAccountDTO as string
                    }
                });
            }
            this.logger.debug(`Creating account for [${createAccountDTO.user_id}] with cookie [${createAccountDTO.auth_cookie}]`);
            return {
                event: 'create_account',
                data: {
					DTO : createAccountDTO,
					success : true,
					msg : 'Successfully created the account',
				}
            };
        }
        this.logger.debug(`Received invalid pattern on auth channel, Auth token: [${payload.data.token}], Event pattern: [${payload.eventPattern}]`);
        return false;
    }

    @SubscribeMessage('retrieve_redirect')
    async handleRetrieveRedirect(client: Socket, payload: FrontEndDTO): Promise<any> {
		this.sockets.storeSocket(payload.userId!, client);
        return {
            event: 'retrieve_redirect',
            data: {
                login: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT}&redirect_uri=http%3A%2F%2F${process.env.WEB_HOST}%3A${process.env.WEB_PORT}%2Flogin&response_type=code`,
                signup: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT}&redirect_uri=http%3A%2F%2F${process.env.WEB_HOST}%3A${process.env.WEB_PORT}%2Fsignup&response_type=code`
            }
        }
    }


	/**
	 * 
	 * @param client client connection Socket
	 * @param payload no additional data, base FrontEndDTO
	 * @returns  See 2fa.DTOs.ts file
	 */
    @UseGuards(AuthGuard)
    @SubscribeMessage('enable_2fa') 
	async enableTwoFactorAuthentication(client : Socket, payload : FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);
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
		let success : boolean = qrCode !== undefined;
		return ({event : 'enable_2fa', data : {
			success : 	success,
			msg		: 	success === true ? 'enabling 2fa succeeded' : 'enabling 2fa failed.',
			qrCode 	:	qrCode,
		}});
	}

	/**
	 * 
	 * @param client client connection socket
	 * @param payload Expects the user generated one-time time-based authentication token. as {TFAToken : string}.
	 * @returns  See 2fa.DTOs.ts file
	 */
    @UseGuards(AuthGuard)
    @SubscribeMessage('verify_2fa') 
	async verifyTFA(client : Socket, payload : FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);
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
		if (!payload.data.TFAToken)
			success = false;
		else
			success = await this.TFA.verify(payload.userId, payload.data.TFAToken);
		return ({
			event : 'verify_2fa', 
			data : {
				success : success,
				msg		: success === true ? 'verifying 2fa succeeded' : 'verifying 2fa failed.',
			}
		});
		};

	/**
	 * 
	 * @param client client connection socket
	 * @param payload  no additional data, base FrontEndDTO
	 * @returns See 2fa.DTOs.ts file
	 */
	@UseGuards(AuthGuard)
	@SubscribeMessage('isEnabled_2fa') 
	async hasTFA(client : Socket, payload : FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);
		let success : Has2FA;

		success = await this.TFA.hasTwoFA(payload.userId!);
		this.logger.log(`user [${payload.userId}] calling isEnabled2fa`);
		let msg: string = "";
		switch (success) {
			case Has2FA.ERROR:
				msg = `2fa is unable to be retrieve from the database ${payload.userId}`;
				break;
			case Has2FA.NO_TFA:
				msg = `2fa is disabled for user ${payload.userId}`;
				break;
			case Has2FA.HAS_TFA:
				msg = `2fa is enabled for user ${payload.userId}`;
				break;
		}
		return ({
			event : 'isEnabled_2fa',
			data : {
				 success	: success == Has2FA.NO_TFA ? false : true,
				 msg		: msg,
		}
		});
	}

	/**
	 * 
	 * @param client client connection socket
	 * @param payload  Expects the user generated time-based one-time authentication token. as {TFAToken : string}.
	 * @returns See 2fa.DTOs.ts file
	 */
	@UseGuards(AuthGuard)
	@SubscribeMessage('remove_2fa') 
	async removeTFA(client : Socket, payload : FrontEndDTO) {
		this.sockets.storeSocket(payload.userId!, client);
		let success : boolean = false;
		const has2FA = await this.TFA.hasTwoFA(payload.userId!);

		if (has2FA === Has2FA.NO_TFA) {
			return ({
				event : 'remove_2fa',
				data : {
					 success 	: false,
					 msg		: `2fa has never been enabled for user, : [${payload.userId}]`,
			}
			});
		} else if (has2FA === Has2FA.ERROR) {
			return ({
				event : 'remove_2fa',
				data : {
					success 	: false,
					msg			: `2fa was unable to be loaded for user, : [${payload.userId}]`,
				}
			});
		}
		if (await this.TFA.verify(payload.userId!, payload.data.TFAToken) === false) {
			return ({
				event : 'remove_2fa',
				data : {
					 success 	: false,
					 msg		: `Verifying token went wrong, please try again, user : ${payload.userId}`,
			}
			});
		}
		
		success = await this.TFA.deleteTwoFA(payload.userId!);
		this.logger.log(`user [${payload.userId}] calling remove2fa`);
		return ({
			event : 'remove_2fa',
			data : {
				 success 	: success,
				 msg		: success === true ? `2fa was successfully removed ${payload.userId}` : `Disabling 2fa somehow went wrong, oops ;o ${payload.userId}`,
		}
		});
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('logout')
	async logoutUser(client : Socket, payload : FrontEndDTO) {
		// this.sockets.sendData([payload.userId!], 'logout', {sucess: true});
		client.emit('logout', {sucess: true})
		await this.queries.removeAllSessions(payload.userId!);
		this.sockets.removeAllSocketsUser(payload.userId!);
	}
}

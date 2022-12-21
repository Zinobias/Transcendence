import {Inject, Injectable, Logger} from '@nestjs/common';
import {Has2FA, Queries} from './database/queries';
import {randomUUID} from 'crypto';
import {Socket} from 'socket.io';
import {Sockets} from './sockets.class';
import {AuthToken} from './auth.objects';
import {TwoFactorAuthService} from './2fa.service';

@Injectable()
export class Auth {
    constructor(
        @Inject(Sockets) private readonly sockets: Sockets,
        @Inject(Queries) private readonly queries: Queries,
		@Inject(TwoFactorAuthService) private readonly TFA : TwoFactorAuthService,
    ) {
        // this.logger.debug(`Creating Auth Class`)
        this.map = new Map<number, string[]>();
    }

    private logger: Logger = new Logger('Auth');

    public readonly map: Map<number, string[]>;

    /**
     * For some unknown reason the get call does not work on the map in this function, the map does still contain
     * all the data though, so we iterate over it instead.
     */
    public validate(userId: number | undefined, accessToken: string | undefined): boolean {
        if (userId === undefined || accessToken === undefined) {
            this.logger.warn(`Received undefined userId [${userId}] or accessToken [${accessToken}] when validating auth`);
            return false;
        }

        let specialGetFindsAuth: boolean = false;
        this.map.forEach((value, key) => {
            if (key != userId) {
                return;
            }
            let result = value.find((val) => {return val === accessToken});
            specialGetFindsAuth = result !== undefined;
        })
        return specialGetFindsAuth;
    }

    public async updateAuth(userId: number) {
        const accessToken: string[] | undefined = await this.queries.loadSession(userId);
        if (accessToken != undefined) {
            // this.logger.debug(`Storing session token for user: [${userId}] token: [${accessToken}]`)
            this.map.set(userId, accessToken);
        }
        // else
            // Logger.warn(`Received undefined accessToken when loading session for user id [${userId}]`)
    }

    private async auth(token: string, signup: boolean): Promise<number | undefined> {
        // this.logger.log(`Received ${signup ? 'signup' : 'login'} event with token [${token}]`);
        const oauthResponse = await fetch(
            'https://api.intra.42.fr/v2/oauth/token',
            {
                method: 'Post',
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: process.env.CLIENT,
                    client_secret: process.env.SECRET,
                    code: token,
                    redirect_uri: signup
                        ? `http://${process.env.WEB_HOST}:3000/signup`
                        : `http://${process.env.WEB_HOST}:3000/login`,
                }),
                headers: {'Content-Type': 'application/json'},
            },
        );
        if (!oauthResponse.ok || oauthResponse.status !== 200) {
            // this.logger.warn(`Failed to get an oauth response`)
            return undefined;
        }
        const json: AuthToken = await oauthResponse.json();
        // this.logger.debug(`Oauth response is:\n${json}`);
        return await this.retrieveUserId(json);
    }

    public async login(client: Socket, token: string, TFAToken? : string): Promise<any | undefined> {
        const userId = await this.auth(token, false);

        if (userId === undefined) {
            this.logger.warn(`Received undefined userId from auth`)
            return undefined;
        }
        if (!await this.queries.userExists(userId)) {
            return undefined;
        }
		this.sockets.storeSocket(userId, client);
		const uuid = randomUUID();
        const has2FA = await this.TFA.hasTwoFA(userId);
		if (has2FA === Has2FA.HAS_TFA) {
			if (TFAToken && await this.TFA.verify(userId, TFAToken) === true) {
                if (await this.storeSession(userId, uuid) === false) {
                    this.logger.error(`Unable to store session for user id [${userId}]`);
                    return undefined;
                }
				return ({
					user_id : userId,
					auth_cookie : uuid,
				});
			}
			else {
				return ({
					user_id : userId,
					auth_cookie : undefined,
				});
			}
		} else if (has2FA == Has2FA.ERROR) {
            return undefined;
        }
        if ((await this.storeSession(userId, uuid)))
            return {user_id: userId, auth_cookie: uuid};
        else {
            this.logger.error(`Unable to store session for user id [${userId}]`);
            return undefined;
        }
    };

    private async retrieveUserId(authToken: AuthToken): Promise<number> {
        // this.logger.log(authToken.access_token);
        const response = await fetch('https://api.intra.42.fr/v2/me', {
            method: 'Get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authToken.access_token,
            },
        });
        const json = await response.json();
        // this.logger.log(json.id);
        return json.id;
    }

    private async storeSession(userId: number, uuid: string): Promise<boolean> {
        const isSuccessful: boolean = await this.queries.storeAuth(userId, uuid);

        if (isSuccessful)
            await this.updateAuth(userId);
        // else
        //     this.logger.warn(`Unable to store auth for user id [${userId}]`)
        return isSuccessful;
    }

    public async createAccount(client: Socket, payload: any): Promise<any | string> {
        // this.logger.log(`Creating an account for [${payload.userName}]`);
        const userId = await this.auth(payload.token, true);
		
        if (userId === undefined)
            return 'Failed to get userId from auth, are you an intra user?';
        if (payload.userName.length < 3 || payload.userName.length > 12)
            return 'Your name has to be between 3 and 12 characters.';
        let createUserResult: string | boolean = await this.queries.createUser(userId, payload.userName);
        if (typeof createUserResult == 'string')
            return createUserResult as string;
        this.sockets.storeSocket(userId, client);
		const uuid = randomUUID();
		if ((await this.storeSession(userId, uuid)))
			return {user_id: userId, auth_cookie: uuid};
		else {
			this.logger.error(`Unable to store session for user id [${userId}]`);
			return `Unknown database error`;
		}
    }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import {SubscribeMessage } from '@nestjs/websockets';
import { Queries } from './database/queries';
import { randomUUID } from 'crypto';
import { Socket} from 'socket.io';
import { Sockets } from './sockets.class';
import {AuthToken } from './auth.objects';


@Injectable()
export class Auth {
  constructor(@Inject(Sockets) private readonly sockets: Sockets,
  @Inject(Queries) private readonly queries : Queries) {}
  private static map = new Map();

  public validate(userId: number | undefined, accessToken: string | undefined): boolean {
    if (userId === undefined || accessToken === undefined)
		return false;
	if (Auth.map.has(userId))
      return Auth.map.get(userId) == accessToken;
    return false;
  }

  public async updateAuth(userId: number) {
    const accessToken: string | undefined = await this.queries.loadSession(
      userId,
    );
    if (accessToken != undefined) {
      Auth.map.set(userId, accessToken);
    }
  }

  private logger = new Logger("auth");

  private async auth(token : string) : Promise<number | undefined> {
	this.logger.log("auth event " + token);
    const oauthResponse = await fetch(
      'https://api.intra.42.fr/v2/oauth/token',
      {
        method: 'Post',
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT,
          client_secret: process.env.SECRET,
          code: token,
          redirect_uri: 'http://localhost:3000/login',
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
	if (!oauthResponse.ok || oauthResponse.status !== 200)
	  return undefined;
    const json: AuthToken = await oauthResponse.json();
    this.logger.log("oauth response " + json);
    return ( await this.retrieveUserId(json)) ;
  }

  public async login(client: Socket, token: string) :
  Promise< any | undefined> {
    // this.logger.log("auth event " + token);
    // const oauthResponse = await fetch(
    //   'https://api.intra.42.fr/v2/oauth/token',
    //   {
    //     method: 'Post',
    //     body: JSON.stringify({
    //       grant_type: 'authorization_code',
    //       client_id: process.env.CLIENT,
    //       client_secret: process.env.SECRET,
    //       code: token,
    //       redirect_uri: 'http://localhost:3000',
    //     }),
    //     headers: { 'Content-Type': 'application/json' },
    //   },
    // );
    // const json: AuthToken = await oauthResponse.json();
    // //this.logger.log("oauth response " + json);
    // const userId = await this.retrieveUserId(client, json);
	const userId = await this.auth(token);
	if (userId === undefined)
		return (undefined);
    this.sockets.storeSocket(userId, client);
	/**
	 * TODO: Check if user in dataBase
	 */
    const uuid = randomUUID();
    return (this.storeSession(userId, uuid));
  }

  private async retrieveUserId(
    authToken: AuthToken,
  ): Promise<number> {
    this.logger.log(authToken.access_token);
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      method: 'Get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken.access_token,
      },
    });
    const json = await response.json();
    this.logger.log(json.id);
    return json.id;
  }

  private async storeSession(userId: number, uuid: string) : 
  	Promise<any | undefined> {
    const success = await this.queries
    	.storeAuth(userId, uuid);
	if (success) {
		await this.updateAuth(userId);
		return ({
		user_id: 		userId,
		auth_cookie: 	uuid,
	});
	}	
	return undefined;
	}

	public async createAccount(client : Socket, payload : any) :
		Promise< any | undefined > {
    this.logger.log("createAccount userName " + payload.userName);
		const userId = await this.auth(payload.token);
		if (userId === undefined)
			return undefined;
		if (await this.queries.createUser(userId, payload.userName) === false)
			return (undefined);
		return (this.login(client, payload.token));
	}
}

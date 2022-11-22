import {Inject, Injectable, Logger} from "@nestjs/common";
// import speakeasy from 'speakeasy';
// import qrcode from 'qrcode';
import { mapGetter } from "./map.tools";
import {Queries} from "./database/queries";


const speakeasy = require(`speakeasy`);
const qrcode = require(`qrcode`);

/**
 * NOTES :
 * 	1. potentially add caching if time left.
 */
@Injectable()
export class TwoFactorAuthService {

	private readonly logger = new Logger('twoFactorAuthService');
	private readonly toBeValidatedMap = new Map<number, string>;
	
	constructor(@Inject(Queries) private readonly queries: Queries) {}

	/**
	 * Generates secret for the given user. Stores the secret in asccii in the map.
	 * @param uid id of user.
	 * @returns qrcode as a dataUrl string on success, undefined on failure.
	 */
	public async generateSecret(uid : number) : Promise<string | undefined> {
		let secret : any = speakeasy.generateSecret({ // Do not type this, the library functions are inconsistent on required types.
			name: "discoPong" // named it will have in authenticator app.,
		});

		if (secret === undefined) {
			this.logger.warn(`GenerateSecret went wrong`);
			return undefined ;
		}
		else {
			this.logger.log(`Generated secret : ${secret}`);
			this.toBeValidatedMap.set(uid, secret.ascii);
		}
		let qrCodeResult : string | void;

		if (secret.otpauth_url)
			qrCodeResult = await qrcode.toDataURL(secret.otpauth_url).catch((e : any) => {
					this.logger.warn(`Generating qrcode went wrong`);
					return (undefined);
				});
		else 
			this.logger.warn(`Generating qrcode went wrong, secret otpauth undefined.`);
		if (qrCodeResult)
			return qrCodeResult;
		return undefined;
	}

	private async dbGetUser2FASecret(uid : number) : Promise<string | undefined> {
		return await this.queries.retrieveTfa(uid);
	}

	private async dbAddUser2FASecret(uid : number, clientSecret : string): Promise<boolean> {
		if (!(await this.queries.storeTfa(uid, clientSecret))) {
			this.logger.warn(`Unable to create user ${uid} with secret ${clientSecret}`);
			return false;
		}
		return true;
	}

	/**
	 * TODO : pull from db to check.
	 * @param uid User to check for
	 * @returns true if user has 2FA, false otherwise.
	 */
	public async hasTwoFA(uid : number) : Promise<boolean> {
		return await this.queries.retrieveTfa(uid) !== undefined;
	}

	public async deleteTwoFA(uid: number): Promise<boolean> {
		return await this.queries.removeTfa(uid);
	}

	/**
	 * 
	 * @param uid user attempting to authenticate.
	 * @param token The time-based one-time token the user generated against the secret.
	 * @returns true if validated, false otherwise.
	 */
	public async verify(uid : number, token : string) : Promise<boolean> {
		let clientSecret = mapGetter(uid,this.toBeValidatedMap);

		if (clientSecret !== undefined) {
			this.logger.log(`adding ${uid} 2fasecret to db a.k.a validating.`);
			if (await this.dbAddUser2FASecret(uid, clientSecret) === false) {
				return false;
			}
			this.toBeValidatedMap.delete(uid);
			this.logger.log(`deleting ${uid} 2fasecret from tobevalidated map`);

		}
		else {
			this.logger.log(`client : [${uid}] not in map `);
			clientSecret = await this.dbGetUser2FASecret(uid);
			if (clientSecret === undefined) {
				this.logger.log(`client : [${uid}] not in map & database `);
				return false;
			}
		}
		let isVerified : boolean = speakeasy.totp.verify( {
			secret: clientSecret, // secret of the user
			encoding: 'ascii', // encoding type of secret
			token : token, //  time-based one-time token (f.e from google auth).
			window : 2, // see if window works, gives more leeway to validating, checks 10 tokens in past & future. against passcode.
		})
		return isVerified;
	}
};

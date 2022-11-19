import { Injectable, Logger } from "@nestjs/common";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';


/**
 * NOTES :
 * 	1. potentially add caching if time left.
 */
@Injectable()
export class twoFactorAuthService {

	private readonly logger = new Logger('twoFactorAuthService');
	private readonly toBeValidatedMap = new Map<number, string>
	
	constructor() {}

	/**
	 * Generates secret for the given user. Stores the secret in asccii in the map.
	 * @param uid id of user.
	 * @returns qrcode as a dataUrl string on success, undefined on failure.
	 */
	public async generateSecret(uid : number) : Promise<string | void | undefined> {
	let secret : speakeasy.GeneratedSecret | undefined = speakeasy.generateSecret({ // Do not type this, the library functions are inconsistent on required types.
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
		qrCodeResult = await qrcode.toDataURL(secret.otpauth_url).catch((e) => {
				this.logger.warn(`Generating qrcode went wrong`);
				return (undefined);
			});
	else 
		this.logger.warn(`Generating qrcode went wrong, secret otpauth undefined.`);
	return qrCodeResult;
	}

	// REMOVE THIS FUNCTION, i JUST COULDN'T HANDLE INTELLISENSE SCREAMING AT ME ;C
	private dbGetUser2FASecret(uid : number) : string {
		return ("kek");
	}
	// REMOVE THIS FUNCTION, i JUST COULDN'T HANDLE INTELLISENSE SCREAMING AT ME ;C

	private dbAddUser2FASecret(uid : number, clientSecret : string) : void {
		return ;
	}

	/**
	 * TODO : pull from db to check.
	 * @param uid User to check for
	 * @returns true if user has 2FA, false otherwise.
	 */
	public async hasTwoFA(uid : number) : Promise<boolean> {
		// dbHasTFA
		return false;
	}

	/**
	 * 
	 * @param uid user attempting to authenticate.
	 * @param token The time-based one-time token the user generated against the secret.
	 * @returns true if validated, false otherwise.
	 */
	public async verify(uid : number, token : string) : Promise<boolean> {
		let clientSecret = this.toBeValidatedMap.get(uid);

		if (clientSecret !== undefined) {
			this.logger.log(`adding ${uid} 2fasecret to db a.k.a validating.`);
			this.dbAddUser2FASecret(uid, clientSecret);
			this.toBeValidatedMap.delete(uid);
			this.logger.log(`deleting ${uid} 2fasecret from tobevalidated map`);

		}
		else {
			this.logger.log(`client : [${uid}] not in map `);
			clientSecret = this.dbGetUser2FASecret(uid);
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

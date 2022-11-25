import {Sessions} from './entities/sessions';
import {InsertResult} from 'typeorm';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Database} from './data-source';
import {UserTable} from './entities/user-table';
import {Tfa} from "./entities/tfa";

@Injectable()
export class Queries {

    private readonly logger = new Logger('queries');

    constructor(@Inject(Database) private database: Database) {
    }

    public async storeAuth(id: number, auth: string): Promise<boolean> {
        const myDataSource = await this.database.getDataSource();
        const repo = myDataSource.getRepository(Sessions);

        if (!await this.userExists(id) === true) //Check if the user is in the database, they can't get a session if they're not
            return false;
        this.logger.debug(`Inserting new auth key for user ${id} with key ${auth}`)
        const insertResult: InsertResult = await repo.upsert(
            [
                {
                    userId: id,
                    sessionCode: auth,
                },
            ],
            ['userId', 'sessionCode'],
        );
        return insertResult.identifiers[0].userId !== undefined;
    }

    private static readonly expireTime = 604800000; // 7 days
    async loadSession(id: number): Promise<string[] | undefined> {
        const myDataSource = await this.database.getDataSource();
        const repo = myDataSource.getRepository(Sessions);
        let session = await repo.findBy({
            userId: id
        }).catch((e) => {
            this.logger.warn(e);
            this.logger.warn(`Unable to retrieve session for user: [${id}]`);
            return undefined;
        });
        if (session === undefined)
            return undefined;
        let sessionCodes: string[] = []
        for (let output of session) {
            if (output.time + Queries.expireTime < new Date().getMilliseconds()) {
                this.logger.warn(`Need to remove this session ${output.sessionCode} for ${output.userId}`);
                break;
            }
            sessionCodes.push(output.sessionCode);
        }
        // if (session === null || session.time + Queries.expireTime < new Date().getMilliseconds()) {
        //     this.logger.debug(`Session expired for user ${id}`)
        //     return undefined;
        // }
        // else
        return sessionCodes;
    }

    public async userNameExists(userName: string): Promise<boolean | string> {
        const myDataSource = await this.database.getDataSource();
        const userTableRepo = myDataSource.getRepository(UserTable);
        try { //Check if a user with this name already exists
            const find = await userTableRepo.findOneBy({
                userName: userName,
            });
            if (find != null) {
                this.logger.debug(`arleady have an account named ${userName}`)
                return `There is already a user with this name`;
            }
        } catch (e) {
            return `Unknown error while saving the user in the database`;
        }
        return false;
    }

    public async userExists(userId: number): Promise<boolean> {
        const myDataSource = await this.database.getDataSource();
        const userTableRepo = myDataSource.getRepository(UserTable);
        try {
            const find = await userTableRepo.findOneBy({
                userId: userId
            });
            if (find == null) 
                return false;
			else
				return true;
        } catch (e) {
            Logger.warn(`Unable to run userExists check query for [${userId}] see error: ${e}`)
        }
        return false;
    }

    public async createUser(userId: number, userName: string): Promise<boolean | string> {
        const myDataSource = await this.database.getDataSource();
        const userTableRepo = myDataSource.getRepository(UserTable);

        if (await this.userExists(userId))
            return `You already have an active account.`;

        try { //Store the user in the database
            await userTableRepo.insert({
                userId: userId,
                userName: userName,
            });
        } catch (e) {
            Logger.warn(`Unable to run save user query for [${userId}] see error: ${e}`)
            return `Unknown error while saving the user in the database`;
        }
        return true;
    }

    public async storeTfa(userId: number, tfaCode: string) : Promise<boolean> {
        try {
            const myDataSource = await this.database.getDataSource();
            const tfaTableRepo = myDataSource.getRepository(Tfa);
            const insert = await tfaTableRepo.upsert([{
                user_id: userId,
                tfa_code: tfaCode,
            }], ['user_id', 'tfa_code']);
            return insert.identifiers[0] !== undefined;
        } catch (e) {
            this.logger.warn(e);
        }
        return false;
    }

    public async retrieveTfa(userId: number): Promise<string | Has2FA> {
        try {
            const myDataSource = await this.database.getDataSource();
            const tfaTableRepo = myDataSource.getRepository(Tfa);
            const result = await tfaTableRepo.findOneBy({user_id: userId});
            if (result?.tfa_code !== undefined)
                return result.tfa_code
        } catch (e) {
            this.logger.error(e);
            return Has2FA.ERROR;
        }
        return Has2FA.NO_TFA;
    }

    public async removeTfa(userId: number): Promise<boolean> {
        try {
            const myDataSource = await this.database.getDataSource();
            const tfaTableRepo = myDataSource.getRepository(Tfa);
            let deleteResult = await tfaTableRepo.delete({user_id: userId});
            if (deleteResult.affected != undefined || deleteResult.affected != null) {
                return deleteResult.affected == 1;
            }
        } catch (e) {
            this.logger.warn(e);
        }
        return false
    }
}

export enum Has2FA {
    ERROR,
    NO_TFA,
    HAS_TFA
}

import {Sessions} from './entities/sessions';
import {InsertResult} from 'typeorm';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Database} from './data-source';
import {UserTable} from './entities/user-table';

@Injectable()
export class Queries {

    private readonly logger = new Logger('queries');

    constructor(@Inject(Database) private database: Database) {
    }

    public async storeAuth(id: number, auth: string): Promise<boolean> {
        const myDataSource = await this.database.getDataSource();
        //const userRepo = myDataSource.getRepository(UserTable);
        const repo = myDataSource.getRepository(Sessions);
        // const repo2 = myDataSource.getRepository(UserTable);
        // console.log("id : ");
        this.logger.log(`Inserting new auth key for user ${id} with key ${auth}`)
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

    public async createUser(userId: number, userName: string) {
        const myDataSource = await this.database.getDataSource();
        const userTableRepo = myDataSource.getRepository(UserTable);
        const find = await userTableRepo.findOneBy({
            userId: userId,
            userName: userName,
        });
        if (find == null) {
            try {
                await userTableRepo.insert({
                    userId: userId,
                    userName: userName,
                });
            } catch (e) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
}

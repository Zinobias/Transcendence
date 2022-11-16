import { Sessions } from './entities/sessions';
import { InsertResult } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Database } from './data-source';
import { UserTable } from './entities/user-table';

@Injectable()
export class Queries {

	private readonly logger = new Logger('queries');

  constructor(@Inject(Database) private database: Database) {}

  public async storeAuth(id: number, auth: string): Promise<boolean> {
    const myDataSource = await this.database.getDataSource();
    //const userRepo = myDataSource.getRepository(UserTable);
    const repo = myDataSource.getRepository(Sessions);
    // const repo2 = myDataSource.getRepository(UserTable);
    // console.log("id : ");
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
  async loadSession(id: number): Promise<string | undefined> {
    const myDataSource = await this.database.getDataSource();
    const repo = myDataSource.getRepository(Sessions);
    const session = await repo.findOneBy({
      userId: id,
    });
    if (
      session === null ||
      session.time + Queries.expireTime < new Date().getMilliseconds()
    )
      return undefined;
    else return session.sessionCode;
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

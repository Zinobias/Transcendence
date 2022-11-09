import { Sessions } from './entities/sessions';
import { InsertResult } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Database } from './data-source';
import { UserTable } from './entities/user-table';

@Injectable()
export class Queries {

constructor(@Inject(Database) private database : Database) {}

  public async storeAuth(id: number, auth: string): Promise<boolean> {
    const myDataSource = await this.database.getDataSource();
    //const userRepo = myDataSource.getRepository(UserTable);
    const repo = myDataSource.getRepository(Sessions);
    // const repo2 = myDataSource.getRepository(UserTable);
	// console.log("id : ");
    const insertResult: InsertResult = await repo.upsert({
      userId: id,
      sessionCode: auth,
    }, ['sessionCode']);
    return insertResult.identifiers.length === 1;
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

  public async createUser(userId : number, userName : string) {
    const myDataSource = await this.database.getDataSource();
    const userTableRepo = myDataSource.getRepository(UserTable);

	const insertResult: InsertResult = await userTableRepo.insert(
	{
		userId : userId,
		userName : userName}
	);
	return insertResult.identifiers.length === 1;
  }
}

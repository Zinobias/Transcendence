import { getDataSource } from './data-source';
import { Sessions } from './entities/sessions';
import { InsertResult } from 'typeorm';

export class Queries {
  private static _instance: Queries;

  public static getInstance(): Queries {
    if (this._instance == undefined) {
      this._instance = new Queries();
    }
    return this._instance;
  }

  async storeAuth(id: number, auth: string): Promise<boolean> {
    const myDataSource = await getDataSource();
    const repo = myDataSource.getRepository(Sessions);
    const insertResult: InsertResult = await repo.insert({
      userId: id,
      sessionCode: auth,
    });
    return insertResult.identifiers.length == 1;
  }

  private static readonly expireTime = 604800000; // 7 days
  async loadSession(id: number): Promise<string | null> {
    const myDataSource = await getDataSource();
    const repo = myDataSource.getRepository(Sessions);
    const session = await repo.findOneBy({
      userId: id,
    });
    if (
      session == undefined ||
      session.time + Queries.expireTime < new Date().getMilliseconds()
    )
      return '';
    else return session.sessionCode;
  }
}

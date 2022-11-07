import { Sessions } from './entities/sessions';
import { InsertResult } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Database } from './data-source';

@Injectable()
export class Queries {

constructor(@Inject(Database) private database : Database) {}

  async storeAuth(id: number, auth: string): Promise<boolean> {
    const myDataSource = await this.database.getDataSource();
    const repo = myDataSource.getRepository(Sessions);
    const insertResult: InsertResult = await repo.insert({
      userId: id,
      sessionCode: auth,
    });
    return insertResult.identifiers.length == 1;
  }

  private static readonly expireTime = 604800000; // 7 days
  async loadSession(id: number): Promise<string | null> {
    const myDataSource = await this.database.getDataSource();
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

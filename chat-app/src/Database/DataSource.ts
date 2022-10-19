import { DataSource } from 'typeorm';
import { UserTable } from './entities/UserTable';
import { Blocked } from './entities/blocked';
import { Friends } from './entities/friends';

export const myDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: [UserTable, Blocked, Friends],
});

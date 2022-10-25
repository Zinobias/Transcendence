import { DataSource } from 'typeorm';
import { UserTable } from './entities/UserTable';
import { Blocked } from './entities/blocked';
import { Friends } from './entities/friends';
import { getEnvironmentData } from 'worker_threads';

export const myDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 3306,
  username: getEnvironmentData('POSTGRES_USER') as string,
  password: getEnvironmentData('POSTGRES_PASSWORD') as string,
  database: getEnvironmentData('POSTGRES_DB') as string,
  entities: [UserTable, Blocked, Friends],
});
import { DataSource } from 'typeorm';
import { UserTable } from './entities/UserTable';
// import { Blocked } from './entities/blocked';
import { Friends } from './entities/friends';
// import { getEnvironmentData } from 'worker_threads';

require('dotenv').config({ path: __dirname + '/.env' });
export const myDataSource = new DataSource({
  type: 'postgres',
  host: '172.18.0.3',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
  entities: [__dirname + '/entities/*.{js,ts}'],
  synchronize: true,
});

myDataSource
  .initialize()
  .then(async () => {
    console.log('Connection initialized with database...');
  })
  .catch((error) => console.log('dsssss', error));

export const getDataSource = (delay = 3000): Promise<DataSource> => {
  if (myDataSource.isInitialized) return Promise.resolve(myDataSource);

  return new Promise((resolve, reject) => {
    console.log('hello');
    setTimeout(() => {
      if (myDataSource.isInitialized) resolve(myDataSource);
      else reject('Failed to create connection with database');
    }, delay);
  });
};

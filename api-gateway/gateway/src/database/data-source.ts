import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

require('dotenv').config({ path: __dirname + '/.env' });
// export const myDataSource = new DataSource({
//   type: 'postgres',
//   host: process.env.POSTGRES_HOST,
//   username: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD,
//   database: process.env.POSTGRES_DB,
//   entities: [__dirname + '/entities/*.{js,ts}'],
//   synchronize: true,
// });

// myDataSource
//   .initialize()
//   .then(async () => {
//     console.log('Connection initialized with database...');
//   })
//   .catch((error) => console.log('Failed to connec to database', error));


// export const getDataSource = (delay = 3000): Promise<DataSource> => {
//   if (myDataSource.isInitialized) return Promise.resolve(myDataSource);

//   return new Promise((resolve, reject) => {
//     console.log('hello');
//     setTimeout(() => {
//       if (myDataSource.isInitialized) resolve(myDataSource);
//       else reject('Failed to create connection with database');
//     }, delay);
//   });
// };



@Injectable()
export class Database {
	constructor(
		private dataSource : DataSource = new DataSource(
		{
			type: 'postgres',
			host: process.env.POSTGRES_HOST,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [__dirname + '/entities/*.{js,ts}'],
			synchronize: true,
		})
	  ) {}


	async onApplicationBootstrap() {
		this.dataSource
		.initialize()
		.then(async () => {
		console.log('Connection initialized with database...');
		})
		.catch((error) => console.log('Failed to connec to database', error));
	}

	public getDataSource = (delay = 3000): Promise<DataSource> => {
		if (this.dataSource.isInitialized) return Promise.resolve(this.dataSource);
	  
		return new Promise((resolve, reject) => {
		  console.log('hello');
		  setTimeout(() => {
			if (this.dataSource.isInitialized) resolve(this.dataSource);
			else reject('Failed to create connection with database');
		  }, delay);
		});
	  };
}
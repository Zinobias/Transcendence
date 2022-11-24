import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {UserTable} from './entities/user-table';
import {Sessions} from './entities/sessions';
import { Tfa } from './entities/tfa';

@Injectable()
export class Database {
    private readonly dataSource;

    constructor() {
        this.dataSource = new DataSource({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [UserTable, Sessions, Tfa],
            synchronize: true,
        });
    }

    async onApplicationBootstrap() {
        this.dataSource
            .initialize()
            .then(async () => {
                console.log('Connection initialized with database...');
            })
            .catch((error) => console.log('Failed to connec to database', error));
    }

    public getDataSource = (delay = 3000): Promise<DataSource> => {
        if (this.dataSource.isInitialized)
          return Promise.resolve(this.dataSource);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.dataSource.isInitialized)
                  resolve(this.dataSource);
                else
                  reject('Failed to create connection with database');
            }, delay);
        });
    };
}

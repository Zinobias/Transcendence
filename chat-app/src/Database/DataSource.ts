import {DataSource} from 'typeorm';
import {user_table} from './entities/UserTable';
import {blocked} from './entities/Blocked';
import {achievements} from './entities/Achievements';
import {chat_channels} from './entities/ChatChannels';
import {chat_channel_settings} from './entities/ChatChannelSettings';
import {chat_members} from './entities/ChatMembers';
import {games} from './entities/Games';
import {sessions} from './entities/Sessions';
import {chat_message} from './entities/ChatMessages';
import {friends} from './entities/Friends';

export const myDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
        user_table,
        blocked,
        achievements,
        chat_channels,
        chat_channel_settings,
        chat_members,
        chat_message,
        friends,
        games,
        sessions,
    ],
    synchronize: true,
});

myDataSource
    .initialize()
    .then(async () => {
        console.log('Connection initialized with database...');
    })
    .catch((error) =>
        console.log('Failed to init connection w/ database', error),
    );

export const getDataSource = (delay = 3000): Promise<DataSource> => {
    if (myDataSource.isInitialized) return Promise.resolve(myDataSource);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (myDataSource.isInitialized) resolve(myDataSource);
            else reject('Failed to create connection with database');
        }, delay);
    });
};

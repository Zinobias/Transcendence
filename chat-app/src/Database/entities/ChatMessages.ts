import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn,} from 'typeorm';
import {Message} from '../../Objects/Message';
import {chat_channels} from './ChatChannels';
import {user_table} from './UserTable';

@Entity()
export class chat_message {
    constructor(channelId: number, message: Message) {
        if (message === undefined) return;
        this.channelId = channelId;
        this.message = message.message;
        this.userId = message.sender;
        this.timestamp = message.timestamp;
    }

    @PrimaryGeneratedColumn()
    messageId: number;

    @PrimaryColumn()
    channelId: number;

    @PrimaryColumn()
    userId: number;

    @Column()
    message: string;

    @Column({type: 'bigint'})
    timestamp: number;

    @ManyToOne(() => chat_channels, (chat) => chat.channelForMessage)
    chat: chat_channels;

    @ManyToOne(() => user_table, (user) => user.messageSender)
    user: user_table;
}

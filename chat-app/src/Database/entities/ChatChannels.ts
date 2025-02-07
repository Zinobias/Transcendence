import {Column, Entity, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn,} from 'typeorm';
import {Channel} from '../../Objects/Channel';
import {user_table} from './UserTable';
import {Logger} from "@nestjs/common";
import {chat_channel_settings} from "./ChatChannelSettings";
import {chat_members} from "./ChatMembers";
import {chat_message} from "./ChatMessages";

@Entity()
export class chat_channels {
    private logger = new Logger('Chat Channel Entity');

    constructor(channel?: Channel) {
        if (channel == undefined)
            return;
        this.logger.debug(`Initializing channel: ${channel}`);
        this.ownerId = channel.owner;
        this.owner2Id = channel.otherOwner;
        this.channelName = channel.channelName;
        this.closed = channel.closed;
        this.password = channel.password;
        this.visible = channel.visible;
    }

    @PrimaryGeneratedColumn()
    channelId: number;

    @PrimaryColumn()
    ownerId: number;

    @Column({nullable: true})
    owner2Id: number;
    @Column({nullable: true})
    channelName: string;

    @Column()
    closed: boolean;

    @Column({nullable: true})
    password: string

    @Column()
    visible: boolean

    @OneToOne(() => user_table, (user) => user.chatOwner)
    user: user_table;

    @OneToOne(() => user_table, (user) => user.chatOwnerTwo, {nullable: true})
    user2: user_table;

    @OneToMany(() => chat_channel_settings, (chat) => chat.channel, {onDelete: 'CASCADE'})
    chatChannelSetting: chat_channel_settings[];

    @OneToMany(() => chat_members, (chat) => chat.channel, {onDelete: 'CASCADE'})
    chatChannelForMember: chat_members[];

    @OneToMany(() => chat_message, (chat) => chat.chat, {onDelete: 'CASCADE'})
    channelForMessage: chat_message[];
}

import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {blocked} from './Blocked';
import {chat_channels} from './ChatChannels';
import {chat_channel_settings} from './ChatChannelSettings';
import {chat_members} from './ChatMembers';
import {chat_message} from './ChatMessages';
import {friends} from './Friends';
import {sessions} from './Sessions';

@Entity('users')
export class user_table {
    constructor(userId: number, userName: string, avatar: any) {
        this.userId = userId;
        this.userName = userName;
        this.avatar = avatar;
        this.createAt = new Date().getTime()
    }

    @PrimaryColumn()
    userId: number;

    @Column()
    userName: string;

    @Column({type: 'bigint'})
    createAt: number;

    @Column({nullable: true, type: 'text'})
    avatar: string;

    @OneToMany(() => blocked, (block) => block.users, {onDelete: 'CASCADE'})
    blockingUsers: blocked[];

    @OneToMany(() => blocked, (block) => block.blocked, {onDelete: 'CASCADE'})
    block: blocked[];

    @OneToMany(() => chat_channels, (chat) => chat.user, {onDelete: 'CASCADE'})
    chatOwner: chat_channels[];

    @OneToMany(() => chat_channels, (chat) => chat.user2, {onDelete: 'CASCADE'})
    chatOwnerTwo: chat_channels[];

    @OneToMany(() => chat_channel_settings, (chat) => chat.actorUser, {onDelete: 'CASCADE'})
    settingActorUser: chat_channel_settings[];

    @OneToMany(() => chat_channel_settings, (chat) => chat.affectedUser, {onDelete: 'CASCADE'})
    settingAffectedUser: chat_channel_settings[];

    @OneToMany(() => chat_members, (chat) => chat.channel, {onDelete: 'CASCADE'})
    chatChannelMember: chat_members[];

    @OneToMany(() => chat_message, (chat) => chat.user, {onDelete: 'CASCADE'})
    messageSender: chat_message[];

    @OneToMany(() => friends, (friend) => friend.user, {onDelete: 'CASCADE'})
    userWithFriends: friends[];

    @OneToMany(() => friends, (friend) => friend.user, {onDelete: 'CASCADE'})
    friend: friends[];

    @OneToMany(() => sessions, (session) => session.user, {onDelete: 'CASCADE'})
    sessionUser: sessions[];
}

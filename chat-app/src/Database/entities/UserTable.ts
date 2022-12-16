<<<<<<< HEAD
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {games} from './Games';
import {achievements} from './Achievements';
=======
import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
>>>>>>> main
import {blocked} from './Blocked';
import {chat_channels} from './ChatChannels';
import {chat_channel_settings} from './ChatChannelSettings';
import {chat_members} from './ChatMembers';
import {chat_message} from './ChatMessages';
import {friends} from './Friends';
import {sessions} from './Sessions';

@Entity('users')
export class user_table {
<<<<<<< HEAD
    constructor(userId: number, userName: string) {
        this.userId = userId;
        this.userName = userName;
    }

    @PrimaryGeneratedColumn()
=======
    constructor(userId: number, userName: string, avatar: any) {
        this.userId = userId;
        this.userName = userName;
        this.avatar = avatar;
        this.createAt = new Date().getTime()
    }

    @PrimaryColumn()
>>>>>>> main
    userId: number;

    @Column()
    userName: string;

<<<<<<< HEAD
    @Column({default: new Date().getTime(), type: 'bigint'})
    createAt: number;

    @OneToMany(() => games, (game) => game.userT, {onDelete: 'CASCADE'})
    game: games[];

    @OneToMany(() => games, (game) => game.user2T, {onDelete: 'CASCADE'})
    game1: games[];

    @OneToMany(() => achievements, (achievement) => achievement.achievementUser, {
        onDelete: 'CASCADE',
    })
    achievement: achievements[];

    @OneToMany(() => blocked, (block) => block.users, {onDelete: 'CASCADE'})
    block: blocked[];

    @OneToMany(() => chat_channels, (chat) => chat.user, {onDelete: 'CASCADE'})
    chat: chat_channels[];

    @OneToMany(() => chat_channels, (chat) => chat.user2, {onDelete: 'CASCADE'})
    chat2: chat_channels[];

    @OneToMany(() => chat_channel_settings, (chat) => chat.user, {
        onDelete: 'CASCADE',
    })
    setting: chat_channel_settings[];

    @OneToMany(() => chat_members, (chat) => chat.channel, {
        onDelete: 'CASCADE',
    })
    member: chat_members[];

    @OneToMany(() => chat_message, (chat) => chat.user, {
        onDelete: 'CASCADE',
    })
    message: chat_message[];

    @OneToMany(() => friends, (friend) => friend.user, {
        onDelete: 'CASCADE',
    })
    friend: friends[];

    @OneToMany(() => sessions, (session) => session.user, {
        onDelete: 'CASCADE',
    })
    session: sessions[];

    @Column({nullable: true, type: "bytea"})
    avatar: Uint8Array;
=======
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
>>>>>>> main
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserTable {
  constructor(userId: number, userName: string) {
    this.userId = userId;
    this.userName = userName;
  }

  @PrimaryColumn()
  userId: number;

  @Column()
  userName: string;

  @Column({ default: new Date() })
  createAt: Date;

  @Column({ type: 'mediumblob' })
  avatar: Buffer;
}

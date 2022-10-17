import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class UserTable {
  constructor(loginId: string, userName: string) {
    this.loginId = loginId;
    this.userName = userName;
  }

  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  loginId: string;

  @Column()
  userName: string;

  @Column({ default: new Date() })
  createAt: Date;

  @Column({ type: 'mediumblob' })
  avatar: Buffer;
}

import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Sessions } from './sessions';
@Entity()
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

  @OneToMany(() => Sessions, (sessions: Sessions) => sessions.userId)
  public sessions: Sessions[];

  // @Column({ type: 'longblob' })
  // avatar: Buffer;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

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

  // @JoinColumn({ name: 'avatarId' })
  // @OneToOne(() => blob, { nullable: true })
  // avatar: blob;
  //
  // @Column({ nullable: true })
  // avatarId: number;
}

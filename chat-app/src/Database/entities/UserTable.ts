import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
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

  // @JoinColumn({ name: 'avatarId' })
  // @OneToOne(() => blob, { nullable: true })
  // avatar: blob;
  //
  // @Column({ nullable: true })
  // avatarId: number;
}

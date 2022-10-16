import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class UserTable {
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

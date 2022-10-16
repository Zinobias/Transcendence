import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Friends {
  @PrimaryColumn()
  userId: number;

  @Column()
  friendId: number;

  @Column()
  active: boolean;
}

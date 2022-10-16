import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Blocked {
  @PrimaryColumn()
  userId: number;

  @Column()
  blockId: number;
}

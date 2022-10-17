import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Blocked {
  constructor(userId: number, blockId) {
    this.userId = userId;
    this.blockId = blockId;
  }
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  blockId: number;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Blocked {
  constructor(userId: number, blockId) {
    this.userId = userId;
    this.blockId = blockId;
  }
  @PrimaryColumn() //TODO: needs to be a foreign key as well
  userId: number;

  @PrimaryColumn() //TODO: needs to be a foreign key as well
  blockId: number;
}

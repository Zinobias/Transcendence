import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserTable } from './UserTable';

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

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'userId' })
  users: UserTable;

  @ManyToOne(() => Blocked, (block) => block.blockId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'blockId' })
  block: Blocked;
}

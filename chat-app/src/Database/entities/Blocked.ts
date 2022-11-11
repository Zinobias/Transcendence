import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class blocked {
  constructor(userId: number, blockId) {
    this.userId = userId;
    this.blockId = blockId;
  }

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  blockId: number;

  @ManyToOne(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  users: user_table;

  @ManyToOne(() => blocked, (block) => block.blockId)
  @JoinColumn({ name: 'blockId' })
  block: blocked;
}

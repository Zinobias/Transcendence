import { Entity, Column } from 'typeorm';

@Entity()
export class chat_message {
  @Column()
  chanelId: number;

  @Column()
  userId: number;

  @Column()
  message: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;
}

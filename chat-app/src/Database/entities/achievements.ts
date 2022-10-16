import { Entity, Column } from 'typeorm';

@Entity()
export class achievements {
  @Column()
  userId: number;

  @Column()
  achievement: string;
}

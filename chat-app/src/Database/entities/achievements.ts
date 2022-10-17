import { Entity, Column } from 'typeorm';

@Entity()
export class achievements {
  @Column()/p
  userId: number;

  @Column()/p
  achievement: string;
}

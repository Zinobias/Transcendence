import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class achievements {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  achievement: string;
}

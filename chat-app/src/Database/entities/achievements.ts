import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class achievements {
  @PrimaryColumn() //TODO: needs to be a foreign key as well
  userId: number;

  @PrimaryColumn()
  achievement: string;
}

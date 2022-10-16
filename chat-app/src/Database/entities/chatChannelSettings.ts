import { Entity, Column } from 'typeorm';
import { Setting } from '../../Objects/Setting';

@Entity()
export class ChatChannelSettings {
  @Column()
  chanelId: number;

  @Column()
  affectedUser: number;

  @Column('longtext')
  from: string;

  @Column('longtext')
  until: string;

  @Column()
  setting: Setting;
}

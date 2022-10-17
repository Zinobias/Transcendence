import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Setting } from '../../Objects/Setting';
import { SettingType } from '../../Enums/SettingType';

@Entity()
export class ChatChannelSettings {
  constructor(setting: Setting) {
    this.chanelId = setting.channelId;
    this.affectedUser = setting.userId;
    this.from = setting.from;
    this.until = setting.until;
    this.setting = setting.setting;
  }

  @PrimaryColumn()
  chanelId: number;

  @PrimaryColumn()
  affectedUser: number;

  @Column('longtext')
  from: number;

  @Column('longtext')
  until: number;

  @PrimaryColumn()
  setting: SettingType;
}

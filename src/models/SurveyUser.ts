import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from 'uuid';

@Entity('surveys_users')
class SurveyUser {

  @PrimaryColumn()
  readonly id: string

  @Column()
  user_id: string;

  @Column()
  survey_id: string;

  @Column()
  value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if(!this.id) {
      this.id = uuid();
    }
  }
  
}

export { SurveyUser };

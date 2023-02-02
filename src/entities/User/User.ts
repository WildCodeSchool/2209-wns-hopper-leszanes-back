import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => User, (user) => user.contacts)
  parent: User[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.parent)
  @JoinTable()
  contacts: User[];

  @Column()
  @Field()
  created_at: Date;

  @Column()
  @Field()
  updated_at: Date;
}

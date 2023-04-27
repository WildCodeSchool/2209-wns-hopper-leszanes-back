import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { User } from "../User/User";
import { File } from "../File/File";

@Entity()
@ObjectType()
export class Transfer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  isPrivate: boolean;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;

  @Field(() => User, { nullable: false })
  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  createdBy: User;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.transfers)
  @JoinTable()
  users: User;

  @Field(() => [File])
  @OneToMany(() => File, (file) => file.transfer)
  files: File[];
}
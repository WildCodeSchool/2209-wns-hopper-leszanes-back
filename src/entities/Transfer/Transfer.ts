import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
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
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  createdBy: User;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, (user) => user.transfers, { nullable: true })
  @JoinTable()
  users: User;

  @Field(() => [File], { nullable: true })
  @OneToMany(() => File, (file) => file.transfer, { nullable: true })
  files: File[];
}

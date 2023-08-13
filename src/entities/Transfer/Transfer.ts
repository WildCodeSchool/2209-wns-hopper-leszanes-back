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
  OneToOne,
} from "typeorm";
import { User } from "../User/User";
import { File } from "../File/File";
import { BaseEntity } from "../../utils/loadRelation";
import { Link } from "../Link/Link";

@Entity()
@ObjectType()
export class Transfer extends BaseEntity {
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
  @ManyToMany(() => User, (user: User) => user.transfers, { nullable: true })
  @JoinTable()
  users: User[];

  @Field(() => [File], { nullable: true })
  @OneToMany(() => File, (file: File) => file.transfer, { nullable: true })
  files: File[];

  @Field(() => Link, { nullable: true, defaultValue: null })
  @OneToOne(() => Link, { nullable: true })
  @JoinColumn()
  link: Link;
}

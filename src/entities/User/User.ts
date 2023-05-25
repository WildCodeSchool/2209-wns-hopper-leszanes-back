import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Transfer } from "../Transfer/Transfer";
import { ZeTransferSubscription } from "../ZeTransferSubscription/ZeTransferSubscription";
import { BaseEntity } from "../../utils/loadRelation";

@Entity()
@ObjectType()
export class User extends BaseEntity {
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

  @Column({ default: false })
  @Field({ defaultValue: false })
  isAdmin: boolean;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.contacts)
  parent: User[];

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, (user) => user.parent)
  @JoinTable()
  contacts: User[];

  @Field(() => [Transfer])
  @ManyToMany(() => Transfer, (tr) => tr.users)
  transfers: Transfer[];

  @Field(() => ZeTransferSubscription)
  @OneToOne(() => ZeTransferSubscription)
  @JoinColumn()
  zeTransferSubscription: ZeTransferSubscription;
}

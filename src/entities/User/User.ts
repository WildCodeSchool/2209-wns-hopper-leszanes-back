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

  @Column({ default: false })
  @Field({ defaultValue: false })
  isAdmin: boolean;

  @Column()
  @Field()
  createdAt: Date;

  @Column({ default: 0 })
  @Field()
  remaining_storage: number;

  @Column()
  @Field()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.contacts)
  parent: User[];

  @Field(() => [User])
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

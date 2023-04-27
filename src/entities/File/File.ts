import { ObjectType, Field, ID } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Transfer } from "../Transfer/Transfer";

@Entity()
@ObjectType()
export class File {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column({ default: "fileName" })
  @Field()
  filename: string;

  @Column()
  @Field()
  size: number;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;

  @Field(() => Transfer, { nullable: false })
  @ManyToOne(() => Transfer, (transfer) => transfer.files, { nullable: false })
  transfer: Transfer;
}

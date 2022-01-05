
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Upvote } from "./Upvote";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    _id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null; // 1 or -1 or null - tells us whehter weve voted on it

    // foreign key in schema
    @Field()
    @Column()
    creatorId: number;

    @OneToMany(() => Upvote, (upvote) => upvote.post)
    upvotes: Upvote[];

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;


}
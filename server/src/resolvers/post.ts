import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";


// CRUD
// CRUD
// CRUD
// CRUD
// CRUD WITH GRAPHQL 

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {

    // Return a small snippet of the text attribute so the whole text isnt loaded on dashboard
    // Not in database - created and sent to client
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 100)
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId)
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(@Root() post: Post, @Ctx() { upvoteLoader, req }: MyContext) {
        if (!req.session.userId) return null;
        const upvote = await upvoteLoader.load({ postId: post._id, userId: req.session.userId })

        return upvote ? upvote.value : null
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpvote = value !== -1
        const realValue = isUpvote ? 1 : -1
        const { userId } = req.session

        const upvote = await Upvote.findOne({ where: { postId, userId } })

        // user has voted on the post and changing their vote
        if (upvote && upvote.value != realValue) {
            getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                    `,
                    [realValue, postId, userId]
                )
                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where _id = $2;
                    `,
                    [realValue * 2, postId]
                );
            })
        } else if (!upvote) {
            // user has not voted on this post
            getConnection().transaction(async tm => {
                await tm.query(`
            insert into upvote ("userId", "postId", value)
            values ($1,$2,$3);
            `, [userId, postId, realValue]);

                await tm.query(`
            update post
            set points = points + $1
            where _id = $2;
            `, [realValue, postId]);
            })
        }
        return true
    }


    // GraphQL query
    // cursor based pagination is more involved but there are advantages over a normal offset
    //      cursor gives all posts after a location
    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = Math.min(50, limit) + 1; // +1 to determine hasMore boolean

        const replacements: any[] = [realLimitPlusOne];
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
        const posts = await getConnection().query(`
        select p.*
        from post p
        ${cursor ? `where p."createdAt" < $2` : ``}
        order by p."createdAt" DESC
        limit $1
        `, replacements)
        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg('id', () => Int) id: number): Promise<Post | undefined> {
        const post = await Post.findOne(id)
        console.log({ post })
        return post;
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(@Arg("input") input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) _id: number,
        @Arg("title") title: string,
        @Arg("text") text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('_id = :_id and "creatorId" = :creatorId', { _id, creatorId: req.session.userId })
            .returning('*')
            .execute()
        return result.raw[0]
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(@Arg("_id", () => Int) _id: number | undefined, @Ctx() { req }: MyContext): Promise<boolean> {

        // Not Cascading
        const post = await Post.findOne(_id)
        if (!post) {
            return false
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error('not authorized')
        }
        await Upvote.delete({ postId: _id })
        await Post.delete({ _id })
        return true;

        // Cascading
        // await Post.delete({ _id, creatorId: req.session.userId })
        // return true
    }
}
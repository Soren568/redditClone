import DataLoader from 'dataloader'
import { Upvote } from '../entities/Upvote';

// Example: 
// pass in postId and userId 
// will return the upvote or null (if you havent upvote post)

// Use this to optimize the number of queries being sent to retrieve certain fields - here we query users once rather than every time per post
// implemented in server index under apolloServer & types.ts (the context)
export const createUpvoteLoader = () => new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
        const upvotes = await Upvote.findByIds(keys as any)
        const upvoteIdsToUpvote: Record<string, Upvote> = {}
        upvotes.forEach(upvote => {
            upvoteIdsToUpvote[`${upvote.userId} | ${upvote.postId}`] = upvote;
        })
        return keys.map((key) => upvoteIdsToUpvote[`${key.userId} | ${key.postId}`])
        // console.log('sorted:', sortedUsers)
    });

import DataLoader from 'dataloader'
import { User } from '../entities/User';

// Example: 
// passes in array of userIds
// will return array of user objects

// Use this to optimize the number of queries being sent to retrieve certain fields - here we query users once rather than every time per post
// implemented in server index under apolloServer & types.ts (the context)
export const createUserLoader = () => new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[])
    const userIdToUser: Record<number, User> = {}
    users.forEach(u => {
        userIdToUser[u._id] = u;
    })
    const sortedUsers = userIds.map((userId) => userIdToUser[userId])
    // console.log('sorted:', sortedUsers)
    return sortedUsers
});

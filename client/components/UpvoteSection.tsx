import { Icon } from '@iconify/react';
import React, { useState } from 'react'
import { PostSnippetFragment, PostsQuery, useVoteMutation } from '../generated/graphql';

interface UpvoteSectionProps {
    post: PostSnippetFragment
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>();
    const [{ fetching, operation }, vote] = useVoteMutation()
    return (
        <div className='flex flex-col bg-gray-200 rounded-l-md items-center p-1'>
            <Icon onClick={async () => {
                if (post.voteStatus === 1) return
                setLoadingState('upvote-loading')
                await vote({ postId: post._id, value: 1 })
                setLoadingState('not-loading')
            }} icon="entypo:arrow-bold-up" className={post.voteStatus === 1 ? 'cursor-pointer hover:bg-gray-300 hover:text-orange-400 text-lg text-orange-500' : 'cursor-pointer text-gray-600 hover:bg-gray-300 hover:text-orange-400 text-lg'} />
            <span className='text-xs font-semibold'>{post.points} </span>
            <Icon onClick={async () => {
                if (post.voteStatus === -1) return
                setLoadingState('downvote-loading')
                await vote({ postId: post._id, value: -1 })
                setLoadingState('not-loading')
            }} icon="entypo:arrow-bold-down" className={post.voteStatus === -1 ? 'cursor-pointer hover:bg-gray-300 hover:text-blue-400 text-lg text-blue-500' : 'cursor-pointer text-gray-600 hover:bg-gray-300 hover:text-blue-400 text-lg'} />
        </div>
    );
}
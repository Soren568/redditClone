import { Icon } from '@iconify/react';
import NextLink from 'next/link'
import React from 'react'
import { useDeletePostMutation } from '../generated/graphql';
import router from 'next/router'

interface EditDeletePostButtonsProps {
    _id: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ _id }) => {
    const [, deletePost] = useDeletePostMutation()
    return (
        <div className='flex mr-1'>
            <Icon onClick={async () => {
                await deletePost({ _id })
                router.replace('/')
            }} icon="bx:bx-trash" className=' text-stone-700 hover:text-stone-400' />
            <Icon onClick={() => router.replace(`/post/edit/${_id}`)} icon="akar-icons:edit" className=' text-stone-700 hover:text-stone-400 ' />
        </div>
    );
}
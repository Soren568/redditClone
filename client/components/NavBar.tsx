import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router'
import { Icon } from '@iconify/react';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const router = useRouter();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({ pause: isServer() }) // tells this command to not run on the server but still run on browser
    let body = null;

    // data loading
    if (fetching) {

        // user not logged in
    } else if (!data?.me) {
        body = (
            <div className='flex space-x-2 w-full'>
                <div className='flex items-center mr-auto space-x-1'>
                    <img src="/favicon.ico" alt="logo" className='w-8' />
                    <NextLink href="/">redditClone</NextLink>
                </div>
                <div className='rounded-full text-sm border-[1px] border-blue-700 px-5 py-1 tracking-wide text-blue-700 hover:bg-blue-100 font-medium'>
                    <NextLink href="/login"> Log In </NextLink>
                </div>
                <div className='rounded-full text-sm border-[1px] bg-blue-600 px-5 py-1 tracking-wide text-gray-200 hover:bg-blue-500 font-medium'>
                    <NextLink href="/register">Sign Up</NextLink>
                </div>
            </div>
        )
        // user logged in
    } else {
        body = (
            <>
                <div className='flex w-full'>
                    <div className='flex items-end mr-auto space-x-1'>
                        <img src="/favicon.ico" alt="logo" className='w-8' />
                        <span className='text-lg'> <NextLink href="/">redditClone</NextLink> </span>
                    </div>
                    <div className='rounded-full text-sm border-[1px] border-blue-700 px-5 py-1 tracking-wide text-blue-700 hover:bg-blue-100 font-medium'>
                        <NextLink href="/create-post">Create Post</NextLink>
                    </div>
                    <div onClick={async () => {
                        await logout()
                        router.reload()
                    }} className='rounded-full text-sm border-[1px] bg-blue-600 px-5 py-1 tracking-wide text-gray-200 hover:bg-blue-500 font-medium cursor-pointer'>Logout</div>
                    {/* <div className='flex items-center border border-transparent hover:border-gray-200 rounded-sm p-1 px-2'>
                        <Icon icon="ep:user" className='text-xl text-gray-400' />
                        <Icon icon="bi:chevron-down" className='text-sm text-gray-800' />
                    </div> */}
                </div>
            </>
        )

    }
    return (
        <div className='bg-slate-100 text-black flex h-10 w-screen align-center items-center justify-between p-4 space-x-4'>
            {body}
        </div>
    );
}
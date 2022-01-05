import { create } from 'domain';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { UpvoteSection } from '../../components/UpvoteSection';
import { useMeQuery, usePostQuery, usePostsQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import NextLink from 'next/link'


export const Post = ({ }) => {
    const [{ data, error, fetching }] = useGetPostFromUrl()
    const [{ data: meData }] = useMeQuery();
    // console.log("Not fetching:", data)
    return (
        !fetching ? (
            <Layout>
                <div className='w-2/3 mx-auto min-h-[6rem] bg-gray-100 rounded-md border-gray-400 border-[1px] flex mt-5'>
                    <UpvoteSection post={data?.post as any} />
                    <div className='ml-2 w-full'>
                        <div className='flex items-center w-full justify-between'>
                            <div>
                                <span className='text-xs'>r/all</span>
                            </div>

                            {meData?.me?._id === data?.post?.creatorId ? (
                                <EditDeletePostButtons _id={data?.post?._id as number} />
                            ) : null}

                        </div>
                        <p className='font-semibold mb-5'>
                            {data?.post?.title}
                        </p>
                        <p className='text-sm text-gray-600'>{data?.post?.text}</p>
                    </div>
                </div>
            </Layout>
        ) : null
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
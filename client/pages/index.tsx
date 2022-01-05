import { withUrqlClient } from 'next-urql'
import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useDeletePostMutation, useMeQuery, usePostsQuery, useUpdatePostMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { Icon } from '@iconify/react'
import { UpvoteSection } from '../components/UpvoteSection'
import NextLink from 'next/link'
import { EditDeletePostButtons } from '../components/EditDeletePostButtons'

const Home = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string, })
  const [{ data: meData }] = useMeQuery()
  const [{ data, error, fetching }] = usePostsQuery({
    variables
  });
  const [, deletePost] = useDeletePostMutation();
  const [, updatePost] = useUpdatePostMutation()
  return (
    <Layout>
      <div className='flex flex-col space-y-3 w-2/3 py-4'>
        {!fetching && !data ? (
          <div>{error?.message}</div>
        ) : null}
        {!data ? null : data.posts.posts.map((p) => !p ? null : (
          <div key={p._id} className='w-full mx-auto min-h-[3rem] bg-gray-100 rounded-md border-gray-400 border-[1px] flex'>
            <UpvoteSection post={p} />
            <div className='ml-2 w-full'>
              <div className='flex items-center w-full justify-between'>
                <div>
                  <span className='text-xs'>r/all</span>
                  <span className='text-[12px] ml-4 text-stone-400'>Posted by {p.creator.username}</span>
                </div>

                {meData?.me?._id === p.creator._id ? (
                  <EditDeletePostButtons _id={p._id} />
                ) : null}

              </div>
              <p className='font-semibold'>
                <NextLink href={`post/[id]`} as={`post/${p._id}`}>
                  {p.title}
                </NextLink>
              </p>
              <p className='text-sm text-gray-600'>{p.textSnippet}...</p>
            </div>
          </div>
        )
        )}
      </div>
      {data && data.posts.hasMore ?
        <button onClick={() => { setVariables({ limit: variables.limit, cursor: data?.posts.posts[data.posts.posts.length - 1].createdAt }) }} className='mx-auto mt-4 mb-8 rounded-full px-4 py-2 text-blue-700 border-[1px] border-blue-700 bg-gray-100 hover:bg-gray-200 w-fit text-xs uppercase' > Load more </button >
        : null
      }
    </Layout >
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Home)

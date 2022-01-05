import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';
import createPost from '../../create-post';


export const EditPost = ({ }) => {
    const router = useRouter()
    console.log('router.query.id: ', router.query)
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data }] = usePostQuery({
        pause: intId === -1, // id of -1 means a bad url parameter
        variables: {
            id: intId
        }
    })
    const [, updatePost] = useUpdatePostMutation()
    console.log({ data })
    if (!data?.post) {
        return (
            <Layout>
                <div>There was an error getting the post data</div>
            </Layout>
        )
    }
    return (
        <Layout>
            <Formik
                initialValues={{ title: data?.post.title as string, text: data?.post.text as string }}
                onSubmit={async (values) => {
                    await updatePost({ id: intId, ...values });
                    router.push('/')
                }}>
                {({ }) => (
                    <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4 w-2/3'>
                        <InputField name='title' placeholder="title" label="Title" textarea={false} />
                        <InputField name='text' placeholder="Type the content...." label="Body" textarea={true} />
                        <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Update Post</button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost)
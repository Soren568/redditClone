import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';


const CreatePost: React.FC<{}> = ({ }) => {
    const router = useRouter()
    useIsAuth()
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    const { error } = await createPost({ input: values })
                    if (!error) {
                        router.push("/")
                    }
                }}>
                {({ }) => (
                    <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>
                        <InputField name='title' placeholder="title" label="Title" textarea={false} />
                        <InputField name='text' placeholder="Type the content...." label="Body" textarea={true} />
                        <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Create Post</button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost)
import { Formik, Form } from 'formik';
import React from 'react'
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link'

interface registerProps { }


export const Login: React.FC<{}> = ({ }) => {
    const router = useRouter()
    const [, login] = useLoginMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values)
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        if (typeof router.query.next === 'string') {
                            router.push(router.query.next)
                        } else {
                            router.push("/")
                        }
                    }
                }}>
                {({ values, handleChange }) => (
                    <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>
                        <InputField name='usernameOrEmail' placeholder="username or email" label="Username or Email" textarea={false} />
                        <div>
                            <InputField name='password' placeholder="password" label="Password" type="password" textarea={false} />
                            <span className='text-xs text-stone-400 hover:text-stone-500 justify-end flex mt-1'>
                                <NextLink href="/forgot-password">  forgot password? </NextLink>
                            </span>
                        </div>
                        <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Login</button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Login) // this keeps ssr off when it is not passed as {ssr: true}
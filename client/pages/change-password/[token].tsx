import { Formik, Form } from 'formik';
import { ValuesOfCorrectTypeRule } from 'graphql';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import router, { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../../components/InputField';
import { Layout } from '../../components/Layout';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';


export const ChangePassword: NextPage<{ token: string }> = () => {
    const router = useRouter();
    const [tokenError, setTokenError] = useState('')
    const [, changePassword] = useChangePasswordMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token: typeof router.query.token === 'string' ? router.query.token : "",
                    });
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token);
                        }
                        setErrors(errorMap)
                    } else if (response.data?.changePassword.user) {
                        router.push('/')
                    }
                }}>
                {({ values, handleChange }) => (
                    <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>
                        <InputField name='newPassword' placeholder="********" label="New Password" type="password" textarea={false} />
                        {tokenError ? (
                            <div className="bg-red-900 text-center py-4 lg:px-4">
                                <div className="p-2 bg-red-800 items-center text-red-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
                                    <span className="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">Warning</span>
                                    <span className="font-semibold mr-2 text-left flex-auto ">{tokenError}</span>
                                    <NextLink href="/forgot-password">click to get a new token</NextLink>
                                </div>
                            </div>) : null}
                        <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Change Password</button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}


export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)
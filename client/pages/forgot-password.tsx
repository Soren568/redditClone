import { Formik, Form } from 'formik';
import router from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';
import NextLink from 'next/link'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

export const ForgotPassword: React.FC<{}> = ({ }) => {
    const [complete, setComplete] = useState(false)
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values, { setErrors }) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}>
                {({ isSubmitting }) => (
                    complete ? <div className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>If an account with that email exists we sent you a reset link</div> : (
                        <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>
                            <InputField name='email' placeholder="email" label="Email" />
                            <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Submit</button>
                        </Form>
                    )
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
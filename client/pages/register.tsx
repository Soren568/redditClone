import { Formik, Form } from 'formik';
import React from 'react'
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface registerProps { }


export const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter()
    const [, register] = useRegisterMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ email: "", username: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ options: values })
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        // worked navigate to landing page
                        router.push("/")
                    }
                }}>
                {({ values, handleChange }) => (
                    <Form className='mt-6 shadow-2xl shadow-slate-400 p-4 rounded-xl bg-slate-100 space-y-4'>
                        <InputField name='username' placeholder="username" label="Username" textarea={false} />
                        <InputField name='email' placeholder="email" label="Email" textarea={false} />
                        <InputField name='password' placeholder="password" label="Password" type="password" textarea={false} />
                        <button type='submit' className='px-4 py-2 text-xs bg-orange-400 text-white rounded-lg tracking-wider hover:shadow-md hover:shadow-orange-300 hover:text-orange-100 hover:bg-orange-500 transition-all ease-linear font-semibold'>Register</button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Register)
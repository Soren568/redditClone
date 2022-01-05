import Head from 'next/head';
import React from 'react'
import { NavBar } from './NavBar';

interface LayoutProps {

}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col h-full min-h-screen align-center items-center bg-slate-200">
            <Head>
                <title>Reddit Clone</title>
                <meta name="description" content="Reddit clone with Typescript, NextJS, GraphQL, MikroORM, Redis, TailwindCSS" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            {children}
        </div>
    );
}
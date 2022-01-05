import "reflect-metadata" // both graphQL and typeorm need this to work
import "dotenv-safe/config"
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors'
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import path from "path"
import { Upvote } from "./entities/Upvote";
import { createUserLoader } from "./util/createUserLoader";
import { createUpvoteLoader } from "./util/createUpvoteLoader";

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Upvote]
    })
    await conn.runMigrations();

    // await Post.delete({})

    const app = express();

    // Order matters - session middleware runs before Apollo middleware
    let RedisStore = connectRedis(session)
    let redis = new Redis(process.env.REDIS_URL)
    app.set("proxy", 1);
    // 
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }))

    app.use(
        session({
            name: COOKIE_NAME, // no meaning to this name
            store: new RedisStore({
                client: redis,
                disableTouch: true, // keeps the session enabled forever to minimize requests to redis
                disableTTL: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true, // can't access cookie from frontend js
                secure: __prod__, // cookie only works in https
                sameSite: 'lax', // csrf 
                // * MAY NEED TO ADD DOMAIN HERE TO BE ABLE TO SEND COOKIES
            },
            saveUninitialized: false, // creates Session by default even without data in it - 
            secret: process.env.SESSION_SECRET, // usually wanna hide this in env var
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground
        ],
        context: ({ req, res }) => ({ req, res, redis, userLoader: createUserLoader(), upvoteLoader: createUpvoteLoader() }) // req lets us access sessions
    })
    await apolloServer.start();

    apolloServer.applyMiddleware({
        app,
        cors: false,
    })
    app.listen(parseInt(process.env.PORT), () => {
        console.log('server started on localhost:4000')
    })
}

main()
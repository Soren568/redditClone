
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from 'ioredis';
import { createUpvoteLoader } from "./util/createUpvoteLoader";
import { createUserLoader } from "./util/createUserLoader";

export type MyContext = {
    req: Request & {
        session: Session & Partial<SessionData> & { userId: number };
    };
    // req: Request & { session: Express.Session }; // question mark means possibly undefined & sign joins the two types together
    redis: Redis;
    res: Response;
    userLoader: ReturnType<typeof createUserLoader>
    upvoteLoader: ReturnType<typeof createUpvoteLoader>
}
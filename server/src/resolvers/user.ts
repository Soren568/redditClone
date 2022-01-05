import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../util/validateRegister";
import { sendEmail } from "../util/sendEmail";
import { v4 } from 'uuid'
import { getConnection } from "typeorm";

@ObjectType() // error of whats wrong in a UI friendly format
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType() // can be returned
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => User, { nullable: true })
    user?: User
    // returns user if it works properly or returns an error
}

// Using argon2 for hashing because it is apparently better than bcrypt
@Resolver(User)
export class UserResolver {
    // This makes it so that other people can not see the email of a post creator upon sql query
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        if (req.session.userId === user._id) {
            return user.email;
        }
        // Another user wants to see the posters email
        return "";
    }


    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [{
                    field: "newPassword",
                    message: "length must be greater than 2"
                }]
            }
        }
        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return {
                errors: [{
                    field: "token",
                    message: "token expired"
                }]
            }
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum)

        if (!user) {
            return {
                errors: [{
                    field: "token",
                    message: "user no longer exists"
                }]
            }
        }

        await User.update({ _id: userIdNum }, { password: await argon2.hash(newPassword) });
        await redis.del(key)
        // log in user after change password
        req.session.userId = user._id

        return { user }
    }

    // * NEED TO SET UP A REAL EMAIL PROVIDER FOR THIS TO WORK IN PROD
    // * NEED TO SET UP A REAL EMAIL PROVIDER FOR THIS TO WORK IN PROD
    // * NEED TO SET UP A REAL EMAIL PROVIDER FOR THIS TO WORK IN PROD
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext) {
        const user = await User.findOne({ where: { email } }) // if searching by column thats not primary key need to use "where"
        if (!user) {
            // email not in db - return true and do nothing to prevent fishing for emails
            return true;
        }

        const token = v4() // returns a random string to create a unique token

        await redis.set(FORGET_PASSWORD_PREFIX + token, user._id, 'ex', 1000 * 60 * 60 * 24 * 3)
        await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}"> reset password </a>`);
        // * NEED TO SET UP A REAL EMAIL PROVIDER FOR THIS TO WORK IN PROD
        return true
    }
    // Login authentication - checks to see if user has cookie and is stored in session
    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null
        }
        return User.findOne(req.session.userId)
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {

        const errors = validateRegister(options);
        if (errors) {
            return { errors }
        }

        const hashedPassword = await argon2.hash(options.password)
        let user;
        try {
            // User.create({
            //     username: options.username,
            //     email: options.email,
            //     password: hashedPassword,
            // }).save()
            // Above the same as next 9 lines
            const result = await getConnection().createQueryBuilder().insert().into(User).values(
                {
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                }
            )
                .returning('*')
                .execute()
            user = result.raw[0]
            console.log(user)
        } catch (err) {
            console.log('err: ' + err)
            if (err.code == '23505') {
                return {
                    errors: [{
                        field: "username",
                        message: "Username taken"
                    }]
                }
            }
            console.log(err.message)
        }

        // Store use id session - giving them a cookie
        req.session.userId = user._id
        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string, // can reuse inputtype args
        @Arg('password') password: string, // can reuse inputtype args
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } })
        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "username does not exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, password) // compare hashed password to entered password
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "Incorrect password"
                }]
            }
        }

        req.session!.userId = user._id;

        // no errors correct login
        return { user }
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) => req.session.destroy((err: any) => {
            if (err) {
                res.clearCookie(COOKIE_NAME) // clears the cookie if logout has worked
                console.log(err)
                resolve(false)
                return
            }

            resolve(true)
        })
        );
    };


}
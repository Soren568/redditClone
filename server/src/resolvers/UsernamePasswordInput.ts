import { Field, InputType } from "type-graphql";

// Another way to handle arguments


@InputType() // use for arguments
export class UsernamePasswordInput {
    @Field()
    email: string;
    @Field()
    username: string;
    @Field()
    password: string;
}

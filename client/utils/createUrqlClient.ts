import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";

import { dedupExchange, fetchExchange, gql, stringifyVariables } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import { readFragment } from "@urql/exchange-graphcache/dist/types/operations/query";
import { isServer } from "./isServer";
import { __Type } from "graphql";

// Any time theres an error in anything we run - it comes through here
const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes("not authenticated")) {
                console.log(error)
                Router.replace("/login")
            }
        })
    )
}

const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldName, fieldArgs) as string, "posts")
        info.partial = !isItInTheCache
        const results: string[] = []
        let hasMore = true;
        fieldInfos.forEach(fi => {
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
            const data = cache.resolve(key, 'posts') as string[]
            const _hasMore = cache.resolve(key, 'hasMore')
            if (!_hasMore) {
                hasMore = _hasMore as boolean
            }
            console.log(data, hasMore)
            results.push(...data)
        })

        return { __typename: "PaginatedPosts", hasMore, posts: results };
    };
};

const invalidateAllPosts = (cache: Cache) => {
    const allFields = cache.inspectFields('Query')
    const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
    fieldInfos.forEach((fi) => {
        cache.invalidate('Query', 'posts', fi.arguments || {})
    })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = ''
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie
    }
    return {
        url: 'http://localhost:4000/graphql',
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? { cookie } : null,
        },
        exchanges: [dedupExchange, cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                }
            },
            updates: {
                Mutation: {
                    deletePost: (_result, args, cache, info) => {
                        cache.invalidate({ __typename: "Post", id: (args as DeletePostMutationVariables)._id })
                    },
                    vote: (_result, args, cache, info) => {
                        const { postId, value } = args as VoteMutationVariables;
                        const data = cache.readFragment(
                            gql`
                            fragment _ on Post {
                                _id
                                points
                                voteStatus
                            }
                        `,
                            { id: postId }
                        );
                        console.log("data:", data)
                        if (data) {
                            if (data.voteStatus === value) return // dont do anything on double vote
                            const newPoints = data.points + ((data.voteStatus ? 2 : 1) * value) // if were switch our vote it should be -2 or +2
                            cache.writeFragment(
                                gql`
                                fragment __ on Post {
                                    points
                                    voteStatus
                                }
                            `,
                                { id: postId, points: newPoints, voteStatus: value }
                            );
                        }
                    },
                    createPost: (_result, args, cache, info) => {
                        invalidateAllPosts(cache)
                    },
                    logout: (_result, args, cache, info) => {
                        // This updates the cache to refresh the page on logout click
                        // wnat to just return null from me query so we update the query
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                        )
                    },
                    login: (_result, args, cache, info) => {
                        // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => { });
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.login.user
                                    }
                                }
                            });
                        invalidateAllPosts(cache)
                    },
                    register: (_result, args, cache, info) => {
                        // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => { });
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.register.user
                                    }
                                }
                            });
                    },
                },
            },
        }), errorExchange, ssrExchange, fetchExchange]
    } as any
};
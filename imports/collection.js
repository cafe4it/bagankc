import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search'

export const Posts = new Mongo.Collection('posts')

export const PostsIndex = new Index({
    collection: Posts,
    fields: ['message', 'story'],
    engine: new MinimongoEngine(),
})
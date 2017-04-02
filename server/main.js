import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import graph from 'fbgraph'
import {Posts} from '../imports/collection'
Meteor.startup(() => {
  // code to run on server at startup

});

Meteor.methods({
    async upsertPost(post){
        return Posts.upsert({_id: post['_id']}, {
            $set: {post}
        })
    },

    updatePosts(limit){
        return new Promise((resolve, reject) => {
            try{
                const settings = Meteor.settings['fbgraph']
                let counter = 1
                function getPosts(address){
                    console.log('query...',counter++)
                    graph.get(address, function (err, res) {
                        if(err){
                            reject(res)
                        }
                        _.each(res['data'], (item) => {
                            if(item && item['message']){
                                item['_id'] = item['id'];
                                item = _.omit(item, 'id')
                                Posts.rawCollection().remove({_id: item['_id']})
                                Posts.rawCollection().insert(item)
                            }
                        })
                        if(limit && limit-- <= 0){
                            resolve(true)
                        }else{
                            if(res.paging && res.paging.next){
                                getPosts(res.paging.next)
                            }else{
                                resolve('done!')
                            }
                        }

                    })
                }
                graph.extendAccessToken({
                    access_token: settings['access_token'],
                    client_id: settings['client_id'],
                    client_secret: settings['client_secret']
                }, (err, result) => {
                    if(err){
                        reject(err)
                    }
                    const access_token = result['access_token']
                    console.log(result)
                    if(access_token){
                        graph.setAccessToken(access_token);
                        getPosts('bagankc/feed');
                    }else{
                        resolve('no access token!')
                    }

                })
            }catch(ex){
                console.log('error', ex)
                reject(ex)
            }
        })
    }
})

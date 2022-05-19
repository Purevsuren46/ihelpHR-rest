const Share = require('../models/Share')
const Follow = require('../models/Follow')
const Notification = require('../models/Notification')
const Like = require('../models/Like')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const Activity = require('../models/Activity')
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Expo = require("expo-server-sdk").Expo

exports.getShares = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Share)

        const shares = await Share.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: shares, pagination, })
    
})

exports.getPostShares = asyncHandler(async (req, res, next) => {
        req.query.post = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Share)

        const shares = await Share.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'createUser', select: 'lastName firstName profile'})

        res.status(200).json({ success: true, data: shares, pagination, })
    
})

exports.getCvShares = asyncHandler(async (req, res, next) => {
        req.query.createUser = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Share)

        const shares = await Share.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'createUser', select: 'lastName firstName profile'})

        res.status(200).json({ success: true, data: shares, pagination, })
    
})

exports.getFollowingShares = asyncHandler(async (req, res, next) => {
        req.query.createUser = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort;
        const select = req.query.select;
      
        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
      
        // Pagination
        const pagination = await paginate(page, limit, Follow)
      
        const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)
      
        const user = follows.map((item)=>item.followUser)
        const post = await Share.find({createUser: {$in: user } }).populate({path: 'post', populate: {path: 'createUser', select: 'lastName firstName profile'}}).populate({path: 'createUser', select: 'lastName firstName profile'}).limit(limit)
        const like = await Like.find({createUser: req.userId, share: {$ne: null}}).select('share')
        const likes = like.map((item)=>item.share)
        const likes1 = likes.map(item=>item.toString())
      
      
        for (let i = 0; i < post.length; i++) {
          if (likes1.includes(post[i]._id.toString()) ) {
            post[i].isLiked = true
          } 
        }
        res.status(200).json({ success: true, data: post, pagination, })
    
})

exports.getShare = asyncHandler( async (req, res, next) => {
    
        const share = await Post.findById(req.params.id).populate({path: 'createUser', select: 'lastName firstName profile'})
        
        if(!share) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // share.name += "-"
        // share.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: share})
    
})

exports.createShare = asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.id)
        post.share += 1
        post.save()
        req.body.createUser = req.userId;
        req.body.sharePost = req.params.id;
        req.body.isShare = true
        const share = await Post.create(req.body);
        req.body.share = share._id
        req.body.who = req.userId
        req.body.for = post.createUser
        const notification = await Notification.create(req.body)
        req.body.createUser = req.userId
        req.body.type = "Share"
        req.body.crud = "Create"
        req.body.postId = req.params.id
        const activity = await Activity.create(req.body)

        const cv = await Cv.findById(post.createUser)
        cv.notification += 1
        cv.save()

        const cv1 = await Cv.findById(req.userId)
        let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
        let messages = [];
        if (!Expo.isExpoPushToken(cv.expoPushToken)) {
            console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
        }
        messages.push({
            to: cv.expoPushToken,
            sound: 'default',
            body: `Таны постыг ${cv1.firstName} хуваалцлаа`,
            data: { notificationId: notification._id, data1: "NetworkingStack" },
          })
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
            for (let chunk of chunks) {
              try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
              } catch (error) {
                console.error(error);
              }
            }
          })();
        res.status(200).json({ success: true, data: share, })
    
})

exports.updateShare = asyncHandler(async (req, res, next) => {
    
        const share = await Share.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!share) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: share, })
        
    
})

exports.deleteShare = asyncHandler(async (req, res, next) => {
        const share = await Share.findById(req.params.id)
        const post = await Post.findById(share.post)

        if(!share) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        post.share -= 1
        post.save()
        share.remove()
        res.status(200).json({ success: true, data: share, })
        
})
const Notification = require('../models/Notification')
const Comment = require('../models/Comment')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Activity = require('../models/Activity')
const Expo = require("expo-server-sdk").Expo

exports.getComments = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Comment)

        const comments = await Comment.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: comments, pagination, })
    
})

exports.getPostComments = asyncHandler(async (req, res, next) => {
        req.query.post = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Comment)

        const comments = await Comment.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: comments, pagination, })
    
})

exports.getComment = asyncHandler( async (req, res, next) => {
    
        const comment = await Comment.findById(req.params.id)
        
        if(!comment) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // comment.name += "-"
        // comment.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: comment})
    
})


exports.createComment = asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.id)

        if(post.createUser == req.userId) {
                post.comment += 1
                post.save()
                req.body.createUser = req.userId;
                req.body.post = req.params.id;
            const like = await Comment.create(req.body);
            const cv1 = await Cv.findById(req.body.createUser)
            like.firstName = cv1.firstName
            like.lastName = cv1.lastName
            like.profile = cv1.profile
            like.save()
            res.status(200).json({ success: true, data: like, })
              } else {
                post.comment += 1
                post.save()
                req.body.createUser = req.userId;
                req.body.post = req.params.id;
                const comment = await Comment.create(req.body);
                req.body.comment = comment._id
                req.body.who = req.userId
                req.body.for = post.createUser
                const notification = await Notification.create(req.body)
                req.body.createUser = req.userId
                req.body.type = "Comment"
                req.body.crud = "Create"
                req.body.postId = req.params.id
                req.body.commentBody = req.body.description
                const activity = await Activity.create(req.body)
                const cv = await Cv.findById(post.createUser)
                cv.notification += 1
                cv.save()
        
                const cv1 = await Cv.findById(req.userId)
                comment.firstName = cv1.firstName
                comment.lastName = cv1.lastName
                comment.profile = cv1.profile
                comment.save()
                let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
                let messages = [];
                if (!Expo.isExpoPushToken(cv.expoPushToken)) {
                    console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
                }
                messages.push({
                    to: cv.expoPushToken,
                    sound: 'default',
                    body: `Таний постон дээр ${cv1.firstName} коммент бичлээ`,
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
        
                res.status(200).json({ success: true, data: comment, act: activity })
              }

    
})

exports.updateComment = asyncHandler(async (req, res, next) => {
    
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!comment) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: comment, })
        
    
})

exports.deleteComment = asyncHandler(async (req, res, next) => {
        const comment = await Comment.findById(req.params.id)
        const post = await Post.findById(comment.post)
        post.comment -= 1
        post.save()
        
        if(!comment) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        comment.remove()
        res.status(200).json({ success: true, data: comment, })
        
})
const Follow = require('../models/Follow')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const Notification = require('../models/Notification')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Activity = require('../models/Activity')
const Expo = require("expo-server-sdk").Expo

exports.getFollows = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Follow)

        const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: follows, pagination, })
    
})

exports.getFollowers = asyncHandler(async (req, res, next) => {
    req.query.followUser = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Follow.find(req.query))

    const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'createUser', select: 'firstName lastName profile occupation organization isEmployee isEmployer'}).populate({path: 'followUser', select: 'firstName lastName profile occupation organization isEmployee isEmployer'})
    const follo = await Follow.find({followUser: req.userId})
    const userList = []
    for(let i = 0; i<follo.length; i++) {
      userList.push(follo[i].createUser.toString())
    } 
    for(let i = 0; i< follows.length; i++) {
      if(userList.includes(follows[i].createUser._id.toString())) {
        follows[i].isFollowing = true 
      }
    }
    res.status(200).json({ success: true, data: follows, pagination, })

})

exports.getCvFollows = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Follow.find(req.query))

    const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'followUser', select: 'firstName lastName profile occupation organization category isEmployee isEmployer'}).populate({path: 'createUser', select: 'organization'})
    const follo = await Follow.find({createUser: req.userId})
    const userList = []
    for(let i = 0; i<follo.length; i++) {
      userList.push(follo[i].followUser.toString())
    } 
    for(let i = 0; i< follows.length; i++) {
      if(follows[i].followUser != null) {
        if(userList.includes(follows[i].followUser._id.toString())) {
          follows[i].isFollowing = true 
        }
      }

    }

    res.status(200).json({ success: true, data: follows, pagination, })

})

exports.getFollow = asyncHandler( async (req, res, next) => {
    
        const follow = await Follow.findById(req.params.id).populate('books')
        
        if(!follow) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // follow.name += "-"
        // follow.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: follow})
    
})

exports.createFollow = asyncHandler(async (req, res, next) => {
    const follows = await Follow.findOne({createUser: `${req.params.id2}`, followUser: `${req.params.id}`}).exec()
    if (follows == null) {
        const post = await Cv.findById(req.params.id)
        const posts = await Cv.findById(req.params.id2)
        post.follower += 1
        post.save()
        posts.following += 1
        posts.save()
        req.body.createUser = req.params.id2;
        req.body.followUser = req.params.id;
    const follow = await Follow.create(req.body);
    req.body.follow = follow._id
    req.body.who = req.params.id2
    req.body.for = req.params.id
    const notification = await Notification.create(req.body)
    req.body.createUser = req.params.id2
    req.body.type = "Follow"
    req.body.crud = "Create"
    req.body.followId = req.params.id
    const activity = await Activity.create(req.body)
    const cv = await Cv.findById(req.params.id)
    cv.notification += 1
    cv.save()

    if (cv.expoPushToken != undefined) {
      const cv1 = await Cv.findById(req.params.id2)
      let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
      let messages = [];
      if (!Expo.isExpoPushToken(cv.expoPushToken)) {
          console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
      }
      messages.push({
          to: cv.expoPushToken,
          sound: 'default',
          body: `Таныг ${cv1.firstName} дагалаа`,
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
    } 
    
    res.status(200).json({ success: true, data: follow, })
    } else {
      const post = await Cv.findById(req.params.id)
      post.follower -= 1
      post.save()
      const posts = await Cv.findById(req.params.id2)
      posts.following -= 1
      posts.save()
      if(!follows) {
      return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
      } 
      follows.remove()
      res.status(200).json({ success: true, data: follows, })
    }
    
})

exports.updateFollow = asyncHandler(async (req, res, next) => {
    
        const follow = await Follow.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!follow) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: follow, })
        
    
})

exports.deleteFollow = asyncHandler(async (req, res, next) => {
        const follow = await Follow.findOne({followUser: req.params.id, createUser: req.params.id2})
        if (follow != null) {
          const post = await Cv.findById(req.params.id)
        post.follower -= 1
        post.save()
        const posts = await Cv.findById(req.params.id2)
        posts.following -= 1
        posts.save()
        if(!follow) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        follow.remove()
        res.status(200).json({ success: true, data: follow, })
        } else {
          throw new MyError("Follow устсан байна.", 400)
        }
        
        
})

exports.deleteFollowId = asyncHandler(async (req, res, next) => {
  const follow = await Follow.findOneAndDelete(req.params.id)

  res.status(200).json({ success: true, data: follow, })


})
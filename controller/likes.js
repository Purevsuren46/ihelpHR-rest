const Like = require('../models/Like')
const Announcement = require('../models/Announcement')
const Share = require('../models/Share')
const Job = require('../models/Job')
const Notification = require('../models/Notification')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Activity = require('../models/Activity')
const Expo = require("expo-server-sdk").Expo


exports.getLikes = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Like)

        const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: likes, pagination, })
    
})

exports.getPostLikes = asyncHandler(async (req, res, next) => {
    req.query.post = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Like.find(req.query))

    const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

    res.status(200).json({ success: true, data: likes, pagination, })

})

exports.getCvLikes = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Like)

    const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

    res.status(200).json({ success: true, data: likes, pagination, })

})

exports.getCvPostLikes = asyncHandler(async (req, res, next) => {
  // req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like.find({createUser: req.params.id, post: {$ne: null}}))

  // const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate("post share").populate({path: "post", populate: {path: "createUser", select: "lastName firstName profile"}}).populate({path: "share", populate: {path: "createUser", select: "lastName firstName profile"}})
    const likes = await Like.find({createUser: req.params.id, post: {$ne: null}}).select('post')

  res.status(200).json({ success: true, data: likes, pagination, })
})

exports.getCvJobLikes = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Like)

    const like = await Like.find({createUser: req.params.id, job: {$ne: null}}).sort(sort).skip(pagination.start - 1).limit(limit)
    // const likes = like.map((item)=>item.job)
    // const likes1 = likes.map(item=>item.toString())
    const likes1 = []
    for (let i = 0; i < (like.length); i++ ) {
      likes1.push(like[i].job.toString())
    }

    res.status(200).json({ success: true, data: likes1, pagination, })

})

exports.getCvAnnouncementLikes = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like)

  const like = await Like.find({createUser: req.params.id, announcement: {$ne: null}}).sort(sort).skip(pagination.start - 1).limit(limit)
  // const likes = like.map((item)=>item.announcement)
  // const likes1 = likes.map(item=>item.toString())
    const likes1 = []
    for (let i = 0; i < (like.length); i++ ) {
      likes1.push(like[i].announcement.toString())
    }

  res.status(200).json({ success: true, data: likes1, pagination, })

})

exports.getJobLikes = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Like)

    const like = await Like.find({createUser: req.params.id, job: {$ne: null}}).sort(sort).skip(pagination.start - 1).limit(limit)
    // const likes = like.map((item)=>item.job)
    // const likes1 = likes.map(item=>item.toString())

    res.status(200).json({ success: true, data: like, pagination, })

})

exports.getAnnouncementLikes = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like)

  const like = await Like.find({createUser: req.params.id, announcement: {$ne: null}}).sort(sort).skip(pagination.start - 1).limit(limit)
  // const likes = like.map((item)=>item.job)
  // const likes1 = likes.map(item=>item.toString())

  res.status(200).json({ success: true, data: like, pagination, })

})

exports.getLike = asyncHandler( async (req, res, next) => {
    
        const like = await Like.findById(req.params.id).populate('books')
        
        if(!like) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // like.name += "-"
        // like.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: like})
    
})

exports.createLike = asyncHandler(async (req, res, next) => {
    const likes = await Like.findOne({createUser: req.userId, post: req.params.id}).exec()
    if (likes == null) {
        const post = await Post.findById(req.params.id)
        const cv1 = await Cv.findById(req.userId)

        if(post.createUser == req.userId) {

          post.like += 1
          post.save()
          req.body.createUser = req.userId;
          req.body.post = req.params.id;
          req.body.firstName = cv1.firstName
          req.body.lastName = cv1.lastName
          req.body.profile = cv1.profile
          req.body.isEmployee = cv1.isEmployee
          req.body.isEmployer = cv1.isEmployer
      const like = await Like.create(req.body);
      like.postInfo = post




      res.status(200).json({ success: true, data: like, })
        } else {
          post.like += 1
        post.save()
        req.body.createUser = req.userId;
        req.body.post = req.params.id;
        req.body.firstName = cv1.firstName
        req.body.lastName = cv1.lastName
        req.body.profile = cv1.profile
        req.body.isEmployee = cv1.isEmployee
        req.body.isEmployer = cv1.isEmployer
    const like = await Like.create(req.body);
        like.postInfo = post
        like.save()


          
    req.body.like = like._id
    req.body.who = req.userId
    req.body.for = post.createUser
    const notification = await Notification.create(req.body)
    req.body.createUser = req.userId
    req.body.type = "Like"
    req.body.crud = "Create"
    req.body.postId = req.params.id
    const activity = await Activity.create(req.body)
    const cv = await Cv.findById(post.createUser)
    cv.notification += 1
    cv.save()
    
    like.firstName = cv1.firstName
    like.lastName = cv1.lastName
    like.profile = cv1.profile
    like.save()

    let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
    let messages = [];
    if (!Expo.isExpoPushToken(cv.expoPushToken)) {
        console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
    }
    messages.push({
        to: cv.expoPushToken,
        sound: 'default',
        body: `Таны постон дээр ${cv1.firstName} лайк дарлаа`,
        data: { notificationId: notification._id, postId: req.params.id, data: "PostDetailScreen", data1: "NetworkingStack" },
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


    res.status(200).json({ success: true, data: like, notification: notification, act: activity })
        }
        
    } else {
        throw new MyError("Like дарсан байна.", 400)
    }
    
})

exports.createJobLike = asyncHandler(async (req, res, next) => {
    const likes = await Like.findOne({createUser: req.userId, job: req.params.id}).exec()
    

    if (likes == null) {
        const post = await Job.findById(req.params.id)

    const cv1 = await Cv.findById(req.userId)
    const job = await Job.findById(req.params.id)
        
        req.body.createUser = req.userId;
        req.body.job = req.params.id;
        req.body.firstName = cv1.firstName
        req.body.lastName = cv1.lastName
        req.body.profile = cv1.profile
        req.body.isEmployee = cv1.isEmployee
        req.body.isEmployer = cv1.isEmployer
    const like = await Like.create(req.body);

        like.jobInfo = job
        like.save()
    req.body.like = like._id
    req.body.who = req.userId
    req.body.for = post.createUser
    req.body.isJob = true
    const notification = await Notification.create(req.body)
    req.body.createUser = req.userId
    req.body.type = "JobSave"
    req.body.crud = "Create"
    req.body.jobId = req.params.id
    const activity = await Activity.create(req.body)
    const cv = await Cv.findById(post.createUser)
    cv.notification += 1
    cv.save()

    let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
    let messages = [];
    if (!Expo.isExpoPushToken(cv.expoPushToken)) {
        console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
    }
    messages.push({
        to: cv.expoPushToken,
        sound: 'default',
        body: `Таны ажлын зарыг ${cv1.firstName} хадгаллаа`,
        data: { notificationId: notification._id },
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
    res.status(200).json({ success: true, data: like, notification: notification, })
    } else {
        throw new MyError("Like дарсан байна.", 400)
    }
    
})

exports.createAnnouncementLike = asyncHandler(async (req, res, next) => {
  const like = await Like.findOne({createUser: req.userId, announcement: req.params.id}).exec()

  if (like == null) {
    const post = await Announcement.findById(req.params.id)
    const cv1 = await Cv.findById(req.userId)
    post.like += 1
    post.save()
    req.body.createUser = req.userId;
    req.body.announcement = req.params.id;
    req.body.firstName = cv1.firstName
    req.body.lastName = cv1.lastName
    req.body.profile = cv1.profile
    req.body.isEmployee = cv1.isEmployee
    req.body.isEmployer = cv1.isEmployer
const like = await Like.create(req.body);
like.announcementInfo = post
like.save()

req.body.like = like._id
req.body.who = req.userId
req.body.for = post.createUser
req.body.isAnnouncement = true
const notification = await Notification.create(req.body)
req.body.createUser = req.userId
req.body.type = "AnnouncementSave"
req.body.crud = "Create"
req.body.announcementId = req.params.id
const activity = await Activity.create(req.body)
const cv = await Cv.findById(post.createUser)
cv.notification += 1
cv.save()

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
let messages = [];
if (!Expo.isExpoPushToken(cv.expoPushToken)) {
    console.error(`Push token ${cv.expoPushToken} is not a valid Expo push token`);
}
messages.push({
    to: cv.expoPushToken,
    sound: 'default',
    body: `Таны ажлын зарыг ${cv1.firstName} хадгаллаа`,
    data: { notificationId: notification._id },
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
res.status(200).json({ success: true, data: like, notification: notification, })
  } else {
    throw new MyError("Like дарсан байна.", 400)
  }

  
})

exports.updateLike = asyncHandler(async (req, res, next) => {
    
        const like = await Like.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!like) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: like, })
        
    
})

exports.deleteLike = asyncHandler(async (req, res, next) => {
        const like = await Like.findOne({post: req.params.id, createUser: req.userId})
        if(!like) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        if(like !== null) {
            const post = await Post.findById(req.params.id)
            const cv = await Cv.findById(post.createUser)
            const notif = await Notification.findOne({who: req.userId, like: like._id, for: post.createUser})
            if(notif != null) {
              if (notif.isRead == false) {
                cv.notification -= 1
                cv.save()
                notif.remove()
              }
            }
            post.like -= 1
            post.save()
            like.remove()
        }

        res.status(200).json({ success: true, data: like, })
        
})

exports.deleteJobLike = asyncHandler(async (req, res, next) => {
    const like = await Like.findOne({job: req.params.id, createUser: req.userId})
    if (like == null) {
    const lik = await Like.findOne({announcement: req.params.id, createUser: req.userId})
    if (lik == null) {
      return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
    } else {
      lik.remove()
      res.status(200).json({ success: true, data: lik, })
    }
    } else {
      like.remove()
      res.status(200).json({ success: true, data: like, })
    }

    
})

exports.deleteId = asyncHandler(async (req, res, next) => {
  const like = await Like.findById(req.params.id)
  if(!like) {
  return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
  } 
  like.remove()


  res.status(200).json({ success: true, data: like, })
  
})
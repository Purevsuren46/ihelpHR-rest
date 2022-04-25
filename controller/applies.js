const Apply = require('../models/Apply')
const Job = require('../models/Job')
const Cv = require('../models/Cv')
const Notification = require('../models/Notification')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Expo = require("expo-server-sdk").Expo

exports.getApplies = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Apply)

        const applies = await Apply.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: applies, pagination, })
    
})

exports.getApply = asyncHandler( async (req, res, next) => {
    
        const apply = await Apply.findById(req.params.id).populate('job')
        if (req.userId == apply.job.createUser) {
            apply.isViewed = true,
            apply.save()
        }
        if(!apply) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // apply.name += "-"
        // apply.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: apply})
    
})

exports.getCvApplies = asyncHandler(async (req, res, next) => {
        req.query.apply = req.params.cvId;
        return this.getApplies(req, res, next);
});
      
exports.createApply = asyncHandler(async (req, res, next) => {
        const likes = await Apply.findOne({createUser: req.userId, job: req.params.id}).exec()
        if (likes == null) {
            const post = await Job.findById(req.params.id)
            post.apply += 1
            post.save()
            req.body.createUser = req.userId;
            req.body.job = req.params.id;
        const like = await Apply.create(req.body);
        req.body.apply = like._id
        req.body.who = req.userId
        req.body.for = post.createUser
        const notification = await Notification.create(req.body)
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
            body: `Таны зар дээр ${cv1.firstName} анкет явууллаа`,
            data: { notificationId: notification._id, postId: req.params.id, data: "UserProfileScreen" },
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
            throw new MyError("Анкет илгээсэн байна.", 400)
        }
//     req.body.createUser = req.userId;
//     req.body.job = req.params.id;
//     const apply = await Apply.create(req.body)

//     res.status(200).json({ success: true, data: apply, })
})

exports.updateApply = asyncHandler(async (req, res, next) => {
    
        const apply = await Apply.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!apply) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: apply, })
        
    
})

exports.deleteApply = asyncHandler(async (req, res, next) => {
        const apply = await Apply.findById(req.params.id)

        if(!apply) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        apply.remove()
        res.status(200).json({ success: true, data: apply, })
        
})
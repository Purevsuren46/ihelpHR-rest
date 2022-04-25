const Like = require('../models/Like')
const Share = require('../models/Share')
const Job = require('../models/Job')
const Notification = require('../models/Notification')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

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
    const pagination = await paginate(page, limit, Like)

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
    const likes = like.map((item)=>item.job)
    const likes1 = likes.map(item=>item.toString())

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

    const like = await Like.find({createUser: req.params.id, job: {$ne: null}}).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: "job", populate: {path: "createUser", select: "firstName lastName name profile"}})
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
        post.like += 1
        post.save()
        req.body.createUser = req.userId;
        req.body.post = req.params.id;
    const like = await Like.create(req.body);
    req.body.like = like._id
    req.body.who = req.userId
    req.body.for = post.createUser
    const notification = await Notification.create(req.body)
    const cv = await Cv.findById(post.createUser)
    cv.notification += 1
    cv.save()
    res.status(200).json({ success: true, data: like, notification: notification, })
    } else {
        throw new MyError("Like дарсан байна.", 400)
    }
    
})

exports.createJobLike = asyncHandler(async (req, res, next) => {
    const likes = await Like.findOne({createUser: req.userId, job: req.params.id}).exec()
    if (likes == null) {
        const post = await Job.findById(req.params.id)
        post.like += 1
        post.save()
        req.body.createUser = req.userId;
        req.body.job = req.params.id;
    const like = await Like.create(req.body);
    req.body.like = like._id
    req.body.who = req.userId
    req.body.for = post.createUser
    const notification = await Notification.create(req.body)
    const cv = await Cv.findById(post.createUser)
    cv.notification += 1
    cv.save()
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
            post.like -= 1
            post.save()
            like.remove()
        }

        res.status(200).json({ success: true, data: like, })
        
})

exports.deleteJobLike = asyncHandler(async (req, res, next) => {
    const like = await Like.findOne({job: req.params.id, createUser: req.userId})
    if(!like) {
    return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
    } 
    like.remove()
    // if(like !== null) {
    //     const post = await Job.findById(req.params.id)
    //     post.like -= 1
    //     post.save()
    //     
    // }

    res.status(200).json({ success: true, data: like, })
    
})
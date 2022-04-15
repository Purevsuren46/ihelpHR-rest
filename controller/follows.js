const Follow = require('../models/Follow')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

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
    const pagination = await paginate(page, limit, Follow)

    const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

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
    const pagination = await paginate(page, limit, Follow)

    const follows = await Follow.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)
    
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
    const follows = await Follow.findOne({createUser: `${req.userId}`, followUser: `${req.params.id}`}).exec()
    if (follows == null) {
        const post = await Cv.findById(req.params.id)
        const posts = await Cv.findById(req.userId)
        post.follower += 1
        post.save()
        posts.following += 1
        posts.save()
        req.body.createUser = req.userId;
        req.body.followUser = req.params.id;
    const follow = await Follow.create(req.body);
    req.body.follow = follow._id
    req.body.who = req.userId
    req.body.for = req.params.id
    const notification = await Notification.create(req.body)
    const cv = await Cv.findById(req.params.id)
    cv.notification += 1
    cv.save()
    res.status(200).json({ success: true, data: follow, })
    } else {
        throw new MyError("Follow дарсан байна.", 400)
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
        const follow = await Follow.findById(req.params.id)
        const post = await Post.findById(follow.post)
        post.follower -= 1
        post.save()
        const posts = await Post.findById(req.userId)
        posts.following -= 1
        posts.save()
        if(!follow) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        follow.remove()
        res.status(200).json({ success: true, data: follow, })
        
})
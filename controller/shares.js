const Share = require('../models/Share')
const Follow = require('../models/Follow')
const Like = require('../models/Like')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

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
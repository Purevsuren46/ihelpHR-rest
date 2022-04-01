const Comment = require('../models/Comment')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

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
    
        const comment = await Comment.findById(req.params.id).populate('books')
        
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
        post.comment += 1
        post.save()
        req.body.createUser = req.userId;
        req.body.post = req.params.id;
        const comment = await Comment.create(req.body);
        res.status(200).json({ success: true, data: comment, })
    
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
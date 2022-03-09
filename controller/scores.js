const Score = require('../models/Score')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getScores = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Score)

        const scores = await Score.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: scores, pagination, })
    
})

exports.getScore = asyncHandler( async (req, res, next) => {
    
        const score = await Score.findById(req.params.id).populate('books')
        
        if(!score) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // score.name += "-"
        // score.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: score})
    
})

exports.getCvScores = asyncHandler(async (req, res, next) => {
        req.query.score = req.params.cvId;
        return this.getScores(req, res, next);
});
      
exports.createScore = asyncHandler(async (req, res, next) => {
    
    req.body.createUser = req.userId;
    req.body.apply = req.params.id;
    const score = await Score.create(req.body)

    res.status(200).json({ success: true, data: score, })
    
    
})

exports.updateScore = asyncHandler(async (req, res, next) => {
    
        const score = await Score.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!score) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: score, })
        
    
})

exports.deleteScore = asyncHandler(async (req, res, next) => {
        const score = await Score.findById(req.params.id)

        if(!score) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        score.remove()
        res.status(200).json({ success: true, data: score, })
        
})
const History = require('../models/History')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getHistories = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, History)

        const histories = await History.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: histories, pagination, })
    
})

exports.getHistory = asyncHandler( async (req, res, next) => {
    
        const history = await History.findById(req.params.id)
        
        if(!history) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        res.status(200).json({ success: true, data: history})
    
})

exports.getCvHistories = asyncHandler(async (req, res, next) => {
        req.query.history = req.params.cvId;
        return this.getHistories(req, res, next);
});

exports.deleteHistory = asyncHandler(async (req, res, next) => {
        const history = await History.findById(req.params.id)

        if(!history) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        history.remove()
        res.status(200).json({ success: true, data: history, })
        
})
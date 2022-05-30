const Transaction = require('../models/Transaction')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getTransactions = asyncHandler(async (req, res, next) => {
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 100;
const sort = req.query.sort;
const select = req.query.select;
["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
// Pagination
const pagination = await paginate(page, limit, Transaction)
const transactions = await Transaction.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)
res.status(200).json({ success: true, data: transactions, pagination, })
    
})

exports.getCvTransactions = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.params.id
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const sort = req.query.sort;
    const select = req.query.select;
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
    // Pagination
    const pagination = await paginate(page, limit, Transaction)
    const transactions = await Transaction.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)
    res.status(200).json({ success: true, data: transactions, pagination, })
        
    })

exports.getTransaction = asyncHandler( async (req, res, next) => {
    
const category = await Transaction.findById(req.params.id).populate('books')

if(!category) {
throw new MyError(req.params.id + " ID-тай категори байхгүй.", 400)
} 

// category.name += "-"
// category.save(function (err) {
// if (err) console.log("error: ", err)
// console.log("saved...")
// })
res.status(200).json({ success: true, data: category})
    
})

exports.createTransaction = asyncHandler(async (req, res, next) => {

const category = await Transaction.create(req.body)

res.status(200).json({ success: true, data: category, })
    
    
})

exports.updateTransaction = asyncHandler(async (req, res, next) => {
    
        const category = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!category) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай категори байхгүй.", })
        } 
        res.status(200).json({ success: true, data: category, })
        
    
})

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
        const category = await Transaction.findById(req.params.id)

        if(!category) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай категори байхгүй.", })
        } 
        category.remove()
        res.status(200).json({ success: true, data: category, })
        
})
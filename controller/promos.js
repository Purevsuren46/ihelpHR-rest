const Notification = require('../models/Notification')
const Promo = require('../models/Promo')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Expo = require("expo-server-sdk").Expo

exports.getPromos = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Promo)

        const promos = await Promo.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'createUser', select: 'lastName firstName profile'})

        res.status(200).json({ success: true, data: promos, pagination, })
    
})


exports.getPromo = asyncHandler( async (req, res, next) => {
    
        const promo = await Promo.findById(req.params.id).populate('books')
        
        if(!promo) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // promo.name += "-"
        // promo.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: promo})
    
})


exports.createPromo = asyncHandler(async (req, res, next) => {
    req.body.createUser = req.userId
    const promo = await Promo.create(req.body)
    
    res.status(200).json({ success: true, data: promo, })
        
        
    })

exports.updatePromo = asyncHandler(async (req, res, next) => {
    
        const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!promo) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: promo, })
        
    
})

exports.deletePromo = asyncHandler(async (req, res, next) => {
        const promo = await Promo.findById(req.params.id)
        const post = await Post.findById(promo.post)
        post.promo -= 1
        post.save()
        
        if(!promo) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        promo.remove()
        res.status(200).json({ success: true, data: promo, })
        
})
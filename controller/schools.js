const Notification = require('../models/Notification')
const School = require('../models/School')
const Cv = require('../models/Cv')
const Post = require('../models/Post')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")
const Expo = require("expo-server-sdk").Expo

exports.getSchools = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, School)

        const schools = await School.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: 'createUser', select: 'lastName firstName profile'})

        res.status(200).json({ success: true, data: schools, pagination, })
    
})


exports.getSchool = asyncHandler( async (req, res, next) => {
    
        const school = await School.findById(req.params.id).populate('books')
        
        if(!school) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // school.name += "-"
        // school.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: school})
    
})


exports.createSchool = asyncHandler(async (req, res, next) => {
    
    const school = await School.create(req.body)
    
    res.status(200).json({ success: true, data: school, })
        
        
    })

exports.updateSchool = asyncHandler(async (req, res, next) => {
    
        const school = await School.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!school) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: school, })
        
    
})

exports.deleteSchool = asyncHandler(async (req, res, next) => {
        const school = await School.findById(req.params.id)
        const post = await Post.findById(school.post)
        post.school -= 1
        post.save()
        
        if(!school) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        school.remove()
        res.status(200).json({ success: true, data: school, })
        
})
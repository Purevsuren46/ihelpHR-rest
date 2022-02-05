const Experience = require('../models/Experience')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getExperiences = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Experience)

        const experiences = await Experience.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: experiences, pagination, })
    
})

exports.getExperience = asyncHandler( async (req, res, next) => {
    
        const experience = await Experience.findById(req.params.id).populate('books')
        
        if(!experience) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // experience.name += "-"
        // experience.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: experience})
    
})

exports.getCvExperiences = asyncHandler(async (req, res, next) => {
        req.query.experience = req.params.cvId;
        return this.getExperiences(req, res, next);
      });
      


exports.createExperience = asyncHandler(async (req, res, next) => {
    console.log("data: ", req.body)
    
    req.body.createUser = req.userId;
    const experience = await Experience.create(req.body)

    res.status(200).json({ success: true, data: experience, })
    
    
})

exports.updateExperience = asyncHandler(async (req, res, next) => {
    
        const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!experience) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: experience, })
        
    
})

exports.deleteExperience = asyncHandler(async (req, res, next) => {
        const experience = await Experience.findById(req.params.id)

        if(!experience) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        experience.remove()
        res.status(200).json({ success: true, data: experience, })
        
})
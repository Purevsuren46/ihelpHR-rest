const Occupation = require('../models/Occupation')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getOccupations = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Occupation)

        const occupations = await Occupation.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: occupations, pagination, })
    
})

exports.getOccupation = asyncHandler( async (req, res, next) => {
    
        const occupation = await Occupation.findById(req.params.id)
        
        if(!occupation) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // occupation.name += "-"
        // occupation.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: occupation})
    
})

exports.getCategoryOccupations = asyncHandler(async (req, res, next) => {
        req.query.category = req.params.categoryId;
        return this.getOccupations(req, res, next);
});

exports.createOccupation = asyncHandler(async (req, res, next) => {

    const occupation = await Occupation.create(req.body)

    res.status(200).json({ success: true, data: occupation, })
    
    
})

exports.updateOccupation = asyncHandler(async (req, res, next) => {
    
        const occupation = await Occupation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!occupation) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: occupation, })
        
    
})

exports.deleteOccupation = asyncHandler(async (req, res, next) => {
        const occupation = await Occupation.findById(req.params.id)

        if(!occupation) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        occupation.remove()
        res.status(200).json({ success: true, data: occupation, })
        
})
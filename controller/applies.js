const Apply = require('../models/Apply')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getApplies = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Apply)

        const applies = await Apply.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: applies, pagination, })
    
})

exports.getApply = asyncHandler( async (req, res, next) => {
    
        const apply = await Apply.findById(req.params.id).populate('job')
        if (req.userId == apply.job.createUser) {
            apply.isViewed = true,
            apply.save()
        }
        if(!apply) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // apply.name += "-"
        // apply.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: apply})
    
})

exports.getCvApplies = asyncHandler(async (req, res, next) => {
        req.query.apply = req.params.cvId;
        return this.getApplies(req, res, next);
});
      
exports.createApply = asyncHandler(async (req, res, next) => {
    
    req.body.createUser = req.userId;
    req.body.job = req.params.id;
    const apply = await Apply.create(req.body)

    res.status(200).json({ success: true, data: apply, })
})

exports.updateApply = asyncHandler(async (req, res, next) => {
    
        const apply = await Apply.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!apply) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: apply, })
        
    
})

exports.deleteApply = asyncHandler(async (req, res, next) => {
        const apply = await Apply.findById(req.params.id)

        if(!apply) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        apply.remove()
        res.status(200).json({ success: true, data: apply, })
        
})
const Course = require('../models/Course')
const Cv = require('../models/Cv')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getCourses = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Course)

        const courses = await Course.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit)

        res.status(200).json({ success: true, data: courses, pagination, })
    
})

exports.getCourse = asyncHandler( async (req, res, next) => {
    
        const course = await Course.findById(req.params.id).populate('books')
        
        if(!course) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        
        // course.name += "-"
        // course.save(function (err) {
        // if (err) console.log("error: ", err)
        // console.log("saved...")
        // })
        res.status(200).json({ success: true, data: course})
    
})

exports.getCvCourses = asyncHandler(async (req, res, next) => {
        req.query.course = req.params.cvId;
        return this.getCourses(req, res, next);
});
      
exports.createCourse = asyncHandler(async (req, res, next) => {
        const cv = await Cv.findById(req.userId)
    req.body.createUser = req.userId;
    const course = await Course.create(req.body)
    cv.course.addToSet(course._id)
    cv.save()
    res.status(200).json({ success: true, data: course, })
    
    
})

exports.updateCourse = asyncHandler(async (req, res, next) => {
    
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if(!course) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        res.status(200).json({ success: true, data: course, })
        
    
})

exports.deleteCourse = asyncHandler(async (req, res, next) => {
        const course = await Course.findById(req.params.id)

        if(!course) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        course.remove()
        res.status(200).json({ success: true, data: course, })
        
})
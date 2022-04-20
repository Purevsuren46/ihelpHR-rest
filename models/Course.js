const mongoose = require("mongoose")
const CourseSchema = new mongoose.Schema({
    description: {
        type: String,
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."],
        default: null
    },
    field: {
        type: String,
    default: null
    },
    school: {
        type: String,
        
    default: null
    },
    grade: {
        type: String,
        
    default: null
    },
    isStudying: {
        type: Boolean,
        
    default: false
    },
    activity: {
        type: String,
        
    default: null
    },
    start: {
        type: Date,
        
    default: null
    },
    end: {
        type: Date,
        
    default: null
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Course", CourseSchema)
const mongoose = require("mongoose")
const CourseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Категорийн тайлбарыг заавал оруулах ёстой.'],
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
    field: {
        type: String
    },
    school: {
        type: String
    },
    grade: {
        type: String
    },
    isStudying: {
        type: Boolean
    },
    activity: {
        type: String
    },
    start: {
        type: Date
    },
    end: {
        type: Date
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Course", CourseSchema)
const mongoose = require("mongoose")
const ExperienceSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Категорийн тайлбарыг заавал оруулах ёстой.'],
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    start: {
        type: Date,
    },
    end: {
        type: Date,
    },
    isWorking: {
        type: Boolean,
    },
    company: {
        type: String,
    },
    occupation: {
        type: String,
    },
    position: {
        type: String,
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})





module.exports = mongoose.model("Experience", ExperienceSchema)
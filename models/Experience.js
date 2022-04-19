const mongoose = require("mongoose")
const ExperienceSchema = new mongoose.Schema({
    description: {
        type: String,
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    do: {
        type: String,
    },
    exitCause: {
        type: String,
    },
    achievements: {
        type: String,
    },
    contactInfo: {
        type: String,
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
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
    },
    occupation: {
        type: String,
    },
    position: {
        type: String,
    },
    location: {
        type: String,
    },
    type: {
        type: String,
        enum: ['Бүтэн цаг', 'Хагас цаг', 'freelancer', 'self-employed', 'contract', 'intern', 'apprentice', 'seasonal' ]
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})





module.exports = mongoose.model("Experience", ExperienceSchema)
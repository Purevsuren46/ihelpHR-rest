const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, "Категорийн нэрийн урт 50 тэмдэгт байх ёстой."]
    },
    description: {
        type: String,
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})






module.exports = mongoose.model("Category", CategorySchema)
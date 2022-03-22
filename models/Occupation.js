const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const OccupationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Категорийн нэрийг оруулна уу"],
        unique: true,
        trim: true,
        maxlength: [50, "Категорийн нэрийн урт 50 тэмдэгт байх ёстой."]
    },
    description: {
        type: String,
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true,
      },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})




module.exports = mongoose.model("Occupation", OccupationSchema)
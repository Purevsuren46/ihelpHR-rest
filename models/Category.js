const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Категорийн нэрийг оруулна уу"],
        unique: true,
        trim: true,
        maxlength: [50, "Категорийн нэрийн урт 50 тэмдэгт байх ёстой."]
    },
    description: {
        type: String,
        required: [true, 'Категорийн тайлбарыг заавал оруулах ёстой.'],
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})


CategorySchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Book').deleteMany({category: this._id})
    
    next()
})



module.exports = mongoose.model("Category", CategorySchema)
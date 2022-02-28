const mongoose = require("mongoose")
const CourseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Категорийн тайлбарыг заавал оруулах ёстой.'],
        maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
    },
    length: {
        type: String
    },
    end: {
        type: Date
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})

CourseSchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Book').deleteMany({course: this._id})
    
    next()
})

module.exports = mongoose.model("Course", CourseSchema)
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
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})


ExperienceSchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Book').deleteMany({experience: this._id})
    
    next()
})



module.exports = mongoose.model("Experience", ExperienceSchema)
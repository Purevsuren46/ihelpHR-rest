const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    photo: {
        type: String,
        default: "photo.jpg"
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("School", SchoolSchema)
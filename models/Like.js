const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const LikeSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },
    share: {
        type: mongoose.Schema.ObjectId,
        ref: 'Share',
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    announcement: {
        type: mongoose.Schema.ObjectId,
        ref: 'Announcement',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Like", LikeSchema)
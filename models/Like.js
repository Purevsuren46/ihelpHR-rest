const mongoose = require("mongoose")
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
    firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      profile: {
        type: String,
      },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Like", LikeSchema)
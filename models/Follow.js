const mongoose = require("mongoose")

const FollowSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    followUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    isFollowing: {
        type: Boolean,
        default: false,
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Follow", FollowSchema)
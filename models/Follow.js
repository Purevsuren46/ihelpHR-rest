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
    createUserInfo: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        profile: {
            type: String,
        },
        occupation: {
            type: String,
        },
        category: {
            type: String,
        },
        isEmployee: {
            type: Boolean,
        },
        isEmployer: {
            type: Boolean,
        },
        organization: {
            type: Boolean,
        },
    },
    followUserInfo: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        profile: {
            type: String,
        },
        occupation: {
            type: String,
        },
        category: {
            type: String,
        },
        isEmployee: {
            type: Boolean,
        },
        isEmployer: {
            type: Boolean,
        },
        organization: {
            type: Boolean,
        },
    },

}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Follow", FollowSchema)
const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const ActivitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Comment", "Like", "Share", "Job", "JobSave", "JobApply", "Follow", "Post"]
    },
    crud: {
        type: String,
        enum: ["Create", "Delete"]
    },
    commentBody: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },
    jobId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    followId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Activity", ActivitySchema)
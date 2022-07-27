const mongoose = require("mongoose")
const CommentSchema = new mongoose.Schema({
    description: {
        type: String,
        sparse: true
    },
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



module.exports = mongoose.model("Comment", CommentSchema)
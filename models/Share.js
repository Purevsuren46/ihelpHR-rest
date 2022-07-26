const mongoose = require("mongoose")
const ShareSchema = new mongoose.Schema({
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
    description: {
        type: String,
        sparse: true
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Share", ShareSchema)
const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
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
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})


CommentSchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Comment').deleteMany({comment: this._id})
    
    next()
})



module.exports = mongoose.model("Comment", CommentSchema)
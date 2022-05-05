const mongoose = require("mongoose")
const ApplySchema = new mongoose.Schema({
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isViewed: {
        type: Boolean,
        default: false,
    },
    success: {
        type: Boolean,
    },
    reminder: {
        type: Boolean,
    }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}} )


module.exports = mongoose.model("Apply", ApplySchema)
const mongoose = require("mongoose")
const PromoSchema = new mongoose.Schema({
    code: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expireDate: {
        type: Date,
        default: Date.now,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Promo", PromoSchema)
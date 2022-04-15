const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const PhoneSchema = new mongoose.Schema({
    phone: {
        type: Number,
    },
    random: {
        type: Number,
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Phone", PhoneSchema)
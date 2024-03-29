const mongoose = require("mongoose")
const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    photo: {
        type: String,
        default: "photo.jpg"
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
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



module.exports = mongoose.model("School", SchoolSchema)
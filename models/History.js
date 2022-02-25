const mongoose = require("mongoose")
const HistorySchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    wallet: {
        type: String
    },
    point: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    authentication: {
        type: String
    },
    role: {
        type: String
    },
    category: {
        type: String
    },
    updateUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    updateByUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})

HistorySchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Book').deleteMany({history: this._id})
    
    next()
})

module.exports = mongoose.model("History", HistorySchema)
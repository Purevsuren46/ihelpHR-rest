const mongoose = require("mongoose")
const { transliterate, slugify} = require('transliteration')
const WalletSchema = new mongoose.Schema({
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
      },
    invoiceId: {
        type: String,
        default: null
      },
    qrImage: {
        type: String,
        default: null
      },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})


WalletSchema.pre("remove", async function(next) {
    console.log("removing ...")
    await this.model('Book').deleteMany({wallet: this._id})
    next()
})

module.exports = mongoose.model("Wallet", WalletSchema)
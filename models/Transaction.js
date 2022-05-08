const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({

  point: {
      type: Number,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});


module.exports = mongoose.model("Transaction", TransactionSchema);
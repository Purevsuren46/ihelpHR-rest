const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({

  point: {
      type: Number,
  },
  explanation: {
    type: String,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});


module.exports = mongoose.model("Transaction", TransactionSchema);
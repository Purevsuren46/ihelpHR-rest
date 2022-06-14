const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({

  point: {
      type: Number,
  },
  firstPoint: {
    type: Number,
},
  explanation: {
    type: String,
    enum: ["ажил үүсгэв", "ажил онцлох болгов","ажил яаралтай болгов","пост бүүстлэв","дансаа цэнэглэв", "ажил хайх үүсгэв", "ажил хайх онцлох болгов", "ажил хайх яаралтай болгов", ""],
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
  },
  announcement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Announcement',
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
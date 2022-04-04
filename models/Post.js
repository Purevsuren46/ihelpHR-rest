const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
      type: String,
      // required: [true, "Ажил олгогчийн нэрийг оруулна уу"]
  },
  body: {
    type: String,
    required: [true, "Тайлбар оруулна уу"]
  },
  photo: {
    type: String
  },
  location: {
      type: String,
  },
  like: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
  share: {
    type: Number,
    default: 0,
  },
  category: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  isBoost: {
    type: Boolean,
    default: false,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  boost: {
    type: Date,
    default: Date.now,
  },
  count: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports = mongoose.model("Post", PostSchema);
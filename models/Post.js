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
  photo: [{
    type: String
  }],
  location: {
      type: String,
  },
  like: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
  comment: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
  share: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
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
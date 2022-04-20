const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    what: {
      type: String,
      trim: true,
      maxlength: [5000, " нэрний урт дээд тал нь 20 тэмдэгт байх ёстой."],
    },
    like: {
      type: mongoose.Schema.ObjectId,
      ref: "Like",
    },
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
    follow: {
      type: mongoose.Schema.ObjectId,
      ref: "Follow",
    },
    apply: {
      type: mongoose.Schema.ObjectId,
      ref: "Apply",
    },
    share: {
      type: mongoose.Schema.ObjectId,
      ref: "Share",
    },
    who: {
      type: mongoose.Schema.ObjectId,
      ref: "Cv",
    },
    for: {
      type: mongoose.Schema.ObjectId,
      ref: "Cv",
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
  },
  },
);

module.exports = mongoose.model("Notification", NotificationSchema);

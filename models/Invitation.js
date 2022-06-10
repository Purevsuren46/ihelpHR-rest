const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema({
  
  description: {
    type: String,
    default: null,
  },
  salary: {
      type: Number,
  },
  occupation: {
    type: String,
  },
  approveStatus: {
    type: String,
    default: "Хүлээгдэж буй",
    enum: ["Зөвшөөрсөн", "Зөвшөөрөөгүй", "Хүлээгдэж буй"],
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});


module.exports = mongoose.model("Invitation", InvitationSchema);
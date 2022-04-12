const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const QuestionnareSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null
  },
  firstName: {
      type: String,
      default: null
  },
  lastName: {
    type: String,
    default: null
  },
  birth: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  humanId: {
    type: String,
    match: [
        /([Ё-Ө]{2}[0-9]{8})/,
        "Регистэр буруу байна.",
    ],
    unique: true,
  },
  working: {
    type: Boolean,
    default: false,
    default: null
  },
  workingCompany: {
    type: mongoose.Schema.ObjectId,
    ref: 'Questionnare',
    default: null
  },
  status: {
    type: String,
    enum: ["opentowork", "working"]
  },
  position: {
    type: String,
    enum: ["senior", "intern", "junior"]
  },
  profession: {
    type: String,
  },
  category: {
    type: String,
  },
  register: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});



module.exports = mongoose.model("Questionnare", QuestionnareSchema);
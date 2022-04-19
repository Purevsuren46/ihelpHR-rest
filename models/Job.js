const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  
  description: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  do: {
    type: String,
    default: null,
  },
  do1: {
    type: String,
    default: null,
  },
  do2: {
    type: String,
    default: null,
  },
  do3: {
    type: String,
    default: null,
  },
  salary: {
      type: String,
      enum: [
          "400,000 - 600,000", 
          "600,000 - 800,000", 
          "800,000 - 1,000,000", 
          "1,000,000 - 1,200,000", 
          "1,200,000 - 1,500,000", 
          "1,500,000 - 1,800,000", 
          "1,800,000 - 2,100,000", 
          "2,100,000 - 2,500,000", 
          "2,500,000 - 3,000,000", 
          "3,000,000 - 4,000,000", 
          "4,000,000 - 5,000,000", 
          "5,000,000 -аас дээш"]
  },
  type: {
      type: String,
      enum: ["Бүтэн цагийн", "Цагийн", "Ээлжийн", "Улирлаар", "Гэрээт/Зөвлөх"],
      default: "Бүтэн цагийн"
  },
  level: {
    type: String,
    enum: ["Мэргэжилтэн", "Дадлага", "Мэргэжил хамаарахгүй", "Дунд шатны удирдлага", "Дээд шатны удирдлага"],
},
  occupation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Occupation',
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  score: {
    type: Number,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  isSpecial: {
    type: Boolean,
    default: false,
  },
  special: {
    type: Date,
    default: Date.now,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  urgent: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Date,
    default: Date.now,
  },
  isEmployer: {
    type: Boolean,
    default: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  skill: {
    type: String,
    default: null,
  },
  skill1: {
    type: String,
    default: null,
  },
  skill2: {
    type: String,
    default: null,
  },
  skill3: {
    type: String,
    default: null,
  },
  contact: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  benefit: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});

JobSchema.methods.getSpecial = function () {

  if (this.special > String(Date.now())) {
    this.isSpecial = true
  } else {
    this.isSpecial = false
  }
}




module.exports = mongoose.model("Job", JobSchema);
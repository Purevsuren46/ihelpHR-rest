const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  
  description: {
    type: String,
    required: [true, "Тайлбар оруулна уу"]
  },
  do: {
    type: String,
    required: [true, "Гүйцэтгэх үүрэг оруулна уу"]
  },
  salary: {
      type: String,
      required: [true, "Цалингаа оруулна уу"],
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
      required: [true, "Ажлын төрлөө сонгоно уу"],
      enum: ["Бүтэн цагийн", "Цагийн", "Ээлжийн", "Улирлаар", "Гэрээт/Зөвлөх"],
      default: "Бүтэн цагийн"
  },
  level: {
    type: String,
    required: [true, "Ажлын түвшин сонгоно уу"],
    enum: ["Мэргэжилтэн", "Дадлага", "Мэргэжил хамаарахгүй", "Дунд шатны удирдлага", "Дээд шатны удирдлага"],
},
  occupation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Occupation',
    required: [true, "Ажлаа оруулна уу"]
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
    default: false,
  },
  count: {
    type: Number,
    default: 0,
  },
  skill: String,
  contact: String,
  location: String,
  experience: String,
  schedule: String,
  benefit: String,
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
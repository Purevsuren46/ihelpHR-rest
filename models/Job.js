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
  gender: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", "Эр", "Эм", "хоёул" ],
  },
  age: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", "18-25", "26-30", "31-36", "37-45", "45-аас дээш", "Хамаагүй"]
  },
  experience: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", "0-1", "1-3", "3-5", "5-10", "10-аас дээш", "Хамаагүй"]
  },
  education: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", "Бүрэн дунд", "Бакалавр", "Магистр", "Доктор"]
  },
  percent: {
    type: Number,
    default: 0,
  },
  salary: {
      type: String,
      default: "Сонгох",
      enum: [
          "Сонгох",
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
  partTimeSalary: {
    type: String,
    default: "Сонгох",
    enum: [
        "Сонгох",
        "1,000 - 3,000₮", 
        "3,000 - 5,000₮",
        "5,000 - 8,000₮"
        ]
  },
  isPartTime: {
    type: Boolean,
    default: false
  },
  isSentCv: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", 'Бүтэн цаг', 'Хагас цаг', 'freelancer', 'self-employed', 'contract', 'intern', 'apprentice', 'seasonal' ]
  },
  level: {
    type: String,
    default: "Сонгох",
    enum: ["Сонгох", "Мэргэжилтэн", "Дадлага", "Мэргэжил хамаарахгүй", "Дунд шатны удирдлага", "Дээд шатны удирдлага"],
  },
  occupation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Occupation',
  },
  occupationName: {
    type: String
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  comCategoryName: {
    type: String
  },
  schedule: {
    type: String,
  },
  language: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profile: {
    type: String,
  },
  isEmployee: {
    type: Boolean,
  },
  isEmployer: {
    type: Boolean,
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
  apply: {
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

JobSchema.pre("remove", async function (next) {

  await this.model('Activity').deleteMany({jobId: this._id})
  next()
});


module.exports = mongoose.model("Job", JobSchema);
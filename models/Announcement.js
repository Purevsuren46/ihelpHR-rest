const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  
  description: {
    type: String,
  },
  do: {
    type: String,
  },
  price: {
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
  time: {
    type: String,
    enum: [
        "1 - 7 хоног", 
        "7 - 14 хоног", 
        "14 - 21 хоног", 
        "21 - 30 хоног", 
        "1 - 2 сар", 
        "2 - 3 сар", 
        "3 - 4 сар", 
        "4 - 6 сар", 
        "6 - 8 сар", 
        "8 - 12 сар", 
        "1 - 2 жил", 
        "2 - 3 жил"]
  },
  workerNumber: {
    type: String,
    enum: [
        "1 - 5", 
        "5 - 10", 
        "10 - 15", 
        "15 - 20", 
        "20 - 30", 
        "30 - 40", 
        "40 - 50", 
        "50 - 100", 
        "100 - 200", 
        "200 - 500", 
        "500 - 1000", 
        "1000 - 10000"]
  },
  occupation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Occupation',
  },
  portfolio: {
    image1: {type: String},
    image2: {type: String},
    image3: {type: String},
    image4: {type: String},
    image5: {type: String},
    image6: {type: String}
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  isCompany: {
    type: Boolean,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  isSpecial: {
    type: Boolean,
    default: false,
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
  occupationName: {
    type: String,
  },
  category: {
    type: String,
  },
  isEmployee: {
    type: Boolean,
  },
  isEmployer: {
    type: Boolean,
  },
  announcementNumber: {
    type: Number,
    default: 0
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
  startDate: {
    type: Date,
    default: Date.now,
  },
  count: {
    type: Number,
    default: 0,
  },
  skill: String,
  specialPermission: String,
  experience: String,
  location: String,
  schedule: String,
  certificate: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports = mongoose.model("Announcement", AnnouncementSchema);
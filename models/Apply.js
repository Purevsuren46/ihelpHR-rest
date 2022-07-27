const mongoose = require("mongoose")
const ApplySchema = new mongoose.Schema({
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    questionnaire: {
        type: mongoose.Schema.ObjectId,
        ref: 'Questionnaire',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isViewed: {
        type: Boolean,
        default: false,
    },
    success: {
        type: Boolean,
    },
    reminder: {
        type: Boolean,
    },
    companyInfo: {
        firstName: {
            type: String,
          },
          profile: {
            type: String,
          },
          category: {
            type: String,
          },
    },
    createUserInfo: {
        firstName: {
            type: String,
          },
          lastName: {
            type: String,
          },  
          profile: {
            type: String,
          },
    },
    jobInfo: {
        type: {
            type: String,
          },
          salary: {
            type: String,
          },  
          occupation: {
            type: String,
          },
    },
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}} )


module.exports = mongoose.model("Apply", ApplySchema)
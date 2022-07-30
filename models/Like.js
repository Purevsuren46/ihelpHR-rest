const mongoose = require("mongoose")
const LikeSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },
    share: {
        type: mongoose.Schema.ObjectId,
        ref: 'Share',
    },
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    announcement: {
        type: mongoose.Schema.ObjectId,
        ref: 'Announcement',
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
      jobInfo: {
        description: {
          type: String,
        },
        title: {
          type: String,
        },
        do: {
          type: String,
        },
        do1: {
          type: String,
        },
        do2: {
          type: String,
        },
        do3: {
          type: String,
        },
        gender: {
          type: String,
        },
        age: {
          type: String,
        },
        experience: {
          type: String,
        },
        education: {
          type: String,
        },
        percent: {
          type: Number,
        },
        salary: {
            type: String,
        },
        partTimeSalary: {
          type: String,
        },
        isPartTime: {
          type: Boolean,
        },
        isSentCv: {
          type: Boolean,
        },
        type: {
          type: String,
        },
        level: {
          type: String,
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
        comJobNumber: {
          type: Number,
        },
        isLiked: {
          type: Boolean,
        },
        isSpecial: {
          type: Boolean,
        },
        special: {
          type: Date,
        },
        isUrgent: {
          type: Boolean,
        },
        urgent: {
          type: Date,
        },
        order: {
          type: Date,
        },
        isEmployer: {
          type: Boolean,
        },
        count: {
          type: Number,
        },
        apply: {
          type: Number,
        },
        skill: {
          type: String,
        },
        skill1: {
          type: String,
        },
        skill2: {
          type: String,
        },
        skill3: {
          type: String,
        },
        contact: {
          type: String,
        },
        location: {
          type: String,
        },
        benefit: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
      announcementInfo: {
        description: {
          type: String,
        },
        do: {
          type: String,
        },
        price: {
            type: String,
        },
        time: {
          type: String,
        },
        workerNumber: {
          type: String,
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
        },
        isSpecial: {
          type: Boolean,
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
        comCategoryName: {
          type: String
        },
        announcementNumber: {
          type: Number,
        },
        special: {
          type: Date,
        },
        isUrgent: {
          type: Boolean,
        },
        urgent: {
          type: Date,
        },
        order: {
          type: Date,
        },
        startDate: {
          type: Date,
        },
        count: {
          type: Number,
        },
        skill: String,
        specialPermission: String,
        experience: String,
        location: String,
        schedule: String,
        certificate: String,
        createdAt: {
          type: Date,
        },
      },
    postInfo: {
      title: {
        type: String,
    },
    body: {
      type: String,
    },
    photo: {
      type: String,
    },
    location: {
        type: String,
    },
    like: {
      type: Number,
    },
    comment: {
      type: Number,
    },
    share: {
      type: Number,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'Cv',
    },
    isBoost: {
      type: Boolean,
    },
    isLiked: {
      type: Boolean,
    },
    boost: {
      type: Date,
    },
    count: {
      type: Number,
    },
    createdAt: {
      type: Date,
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
    profession: {
      type: String,
    },
    organization: {
      type: String,
    },
    workingCompany: {
      type: String,
    },
    status: {
      type: String,
    },
  sharePost: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
  },
  
  shareDescription: {
      type: String,
  },
  isShare: {
      type: Boolean,
  },
  shareInfo: {
    title: {
      type: String,
  },
  body: {
    type: String,
  },
  photo: {
    type: String,
  },
  location: {
      type: String,
  },
  like: {
    type: Number,
  },
  comment: {
    type: Number,
  },
  share: {
    type: Number,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  isBoost: {
    type: Boolean,
  },
  isLiked: {
    type: Boolean,
  },
  boost: {
    type: Date,
  },
  count: {
    type: Number,
  },
  createdAt: {
    type: Date,
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
  profession: {
    type: String,
  },
  organization: {
    type: String,
  },
  workingCompany: {
    type: String,
  },
  status: {
    type: String,
  },
  sharePost: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
  
  shareDescription: {
    type: String,
  },
  isShare: {
    type: Boolean,
  },
  },
    }
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Like", LikeSchema)
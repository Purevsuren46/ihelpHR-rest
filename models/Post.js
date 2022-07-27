const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
      type: String,
      // required: [true, "Ажил олгогчийн нэрийг оруулна уу"]
  },
  body: {
    type: String,
    // required: [true, "Тайлбар оруулна уу"]
  },
  photo: {
    type: String,
  },
  location: {
      type: String,
  },
  like: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
  share: {
    type: Number,
    default: 0,
  },
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
  isLiked: {
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
    default: false
},
shareInfo: {
  title: {
    type: String,
    // required: [true, "Ажил олгогчийн нэрийг оруулна уу"]
},
body: {
  type: String,
  // required: [true, "Тайлбар оруулна уу"]
},
photo: {
  type: String,
},
location: {
    type: String,
},
like: {
  type: Number,
  default: 0,
},
comment: {
  type: Number,
  default: 0,
},
share: {
  type: Number,
  default: 0,
},
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
isLiked: {
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
  default: false
},
},
});
PostSchema.pre("remove", async function (next) {

  await this.model('Activity').deleteMany({postId: this._id})
  next()
});


module.exports = mongoose.model("Post", PostSchema);
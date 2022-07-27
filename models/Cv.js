const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const CvSchema = new mongoose.Schema({
  phone: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Хэрэглэгчийн имэйл оруулна уу"],
  },
  name: {
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
    default: "ihelp.jpg"
  },
  cover: {
    type: String,
    default: "cover.jpg"
  },
  authPhoto: {
    type: String,
  },
  status: {
    type: String,
    default: "null",
    enum: ["opentowork", "working", "getEmployee", "lookingForJob", "null"],
  },
  portfolio: {
    image1: {type: String},
    image2: {type: String},
    image3: {type: String},
    image4: {type: String},
    image5: {type: String},
    image6: {type: String}
  },
  invoiceId: {
    type: String,
  },
  invoiceSocialId: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  qrImage: {
    type: String,
  },
  location: {
    type: String,
  },
  organization: {
    type: Boolean,
    default: false,
  },
  isSentCv: {
    type: Boolean,
    default: false,
  },
  about: {
    type: String,
    default: "me"
  },
  authentication: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: "ihelp.jpg"
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  apply: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    required: [true, "Хэрэглэгчийн эрхийг оруулна уу"],
    enum: ["user", "operator", "admin"],
    default: "user",
  },
  password: {
    type: String,
    minlength: 4,
    required: [true, "Нууц үгээ оруулна уу"],
    select: false,
  },
  filter: {
    type: String,
  },
  following: {
    type: Number,
    default: 0,
  },
  follower: {
    type: Number,
    default: 0,
  },
  postNumber: {
    type: Number,
    default: 0,
  },
  point: {
    type: Number,
    default: 0
  },
  wallet: {
    type: Number,
    default: 0
  },
  notification: {
    type: Number,
    default: 0
  },
  jobNumber: {
    type: Number,
    default: 0
  },
  announcementNumber: {
    type: Number,
    default: 0
  },
  isEmployeeSpecial: {
    type: Boolean,
    default: false,
  },
  isFollowing: {
    type: Boolean,
    default: false,
  },
  employeeSpecial: {
    type: Date,
    default: Date.now,
  },
  isEmployerSpecial: {
    type: Boolean,
    default: false,
  },
  employerSpecial: {
    type: Date,
    default: Date.now,
  },
  isCvList: {
    type: Boolean,
    default: false,
  },
  cvList: {
    type: Date,
    default: Date.now,
  },
  profession: {
    type: String,
  },
  workingCompany: {
    type: String,
  },
  questionnaire: {
    type: mongoose.Schema.ObjectId,
    ref: "Questionnaire",
  },
  category: {
    type: String,
  },
  promoId: {
    type: mongoose.Schema.ObjectId,
    ref: "Cv",
  },
  promo: {
    type: String,
  },
  register: {
    type: String,
  },
  expoPushToken: {
    type: String,
  },
  isEmployee: {
    type: Boolean,
    default: false,
  },
  isEmployer: {
    type: Boolean,
    default: false,
  },
  createYear: {
    type: Date,
  },
  web: {
    type: String,
  },
  employerNumber: {
    type: String,
    enum: ["1-10", "11-20", "21-50", "51-100", "101-500", "501-1000", "1000+"]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});

CvSchema.pre("save", async function (next) {
  // Нууц үг өөрчлөгдөөгүй бол дараачийн middleware рүү шилж
  if (!this.isModified("password")) next();

  // Нууц үг өөрчлөгдсөн
  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

CvSchema.pre("remove", async function (next) {
  await this.model('Post').deleteMany({createUser: this._id})
  const following = await this.model('Follow').find({createUser: this._id})
  const followList = []
  for (let i = 0; i < following.length; i++ ) {
    followList.push(following[i].followUser)
  }
  const follow = await this.model('Cv').find({_id: followList})
  for (let i = 0; i < follow.length; i++ ) {
    follow[i].follower -= 1
    follow[i].save()
  }

  await this.model('Follow').deleteMany({createUser: this._id})
  await this.model('Job').deleteMany({createUser: this._id})
  await this.model('Notification').deleteMany({for: this._id})
  await this.model('Comment').deleteMany({createUser: this._id})
  await this.model('Wallet').deleteMany({createUser: this._id})
  await this.model('Activity').deleteMany({createUser: this._id})
  await this.model('Invitation').deleteMany({createUser: this._id})
  await this.model('Invitation').deleteMany({candidate: this._id})
  await this.model('Apply').deleteMany({createUser: this._id})
  await this.model('Promo').deleteMany({createUser: this._id})
  await this.model('Questionnaire').deleteMany({createUser: this._id})
  next()
});

CvSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role, name: this.name, lastName: this.lastName, firstName: this.firstName, profile: this.profile, phone: this.phone },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRESIN,
    }
  );

  return token;
};

CvSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

CvSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(3).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Cv", CvSchema);
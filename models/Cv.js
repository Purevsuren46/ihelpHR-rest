const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const CvSchema = new mongoose.Schema({
  phone: {
    type: Number,
    unique: true,
    required: [true, "Хэрэглэгчийн утасны дугаар оруулна уу"],
  },
  email: {
    type: String,
    match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Имэйл хаяг буруу байна.",
    ],
    required: [true, "Хэрэглэгчийн имэйл оруулна уу"],
    unique: true,
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
  birth: {
    type: Date,
    default: null
  },
  profile: {
    type: String,
    default: null
  },
  cover: {
    type: String,
    default: null
  },
  authPhoto: {
    type: String,
    default: null
  },
  portfolio: [{
    type: String,
    default: null
  }],
  invoiceId: {
    type: String,
    default: null
  },
  qrImage: {
    type: String,
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
  organization: {
    type: Boolean,
    default: false,
  },
  about: {
    type: String,
    default: null
  },
  authentication: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: null
  },
  working: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  workingCompany: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
    default: null
  },
  status: {
    type: String,
    enum: ["opentowork"]
  },
  position: {
    type: String,
    enum: ["senior", "intern", "junior"]
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
    default: null
  },
  job: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    default: null
  }],
  profession: {
    type: String,
  },
  category: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  }],
  experience: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Experience',
    default: null
  }],
  course: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    default: null
  }],
  comment: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  }],
  isEmployer: {
    type: Boolean
  },
  isEmployee: {
    type: Boolean
  },
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: "Cv",
    default: null
  }],
  follower: [{
    type: mongoose.Schema.ObjectId,
    ref: "Cv",
    default: null
  }],
  post: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    default: null
  }],
  likePost: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    default: null
  }],
  point: {
    type: Number,
    default: 0
  },
  wallet: {
    type: Number,
    default: 0
  },
  isSpecial: {
    type: Boolean,
    default: false,
  },
  special: {
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
  isUrgent: {
    type: Boolean,
    default: false,
  },
  urgent: {
    type: Date,
    default: Date.now,
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

CvSchema.pre("save", async function (next) {
  // Нууц үг өөрчлөгдөөгүй бол дараачийн middleware рүү шилж
  if (!this.isModified("password")) next();

  // Нууц үг өөрчлөгдсөн
  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

CvSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
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
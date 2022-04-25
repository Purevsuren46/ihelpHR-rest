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
  occupation: {
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
  portfolio: [{
    type: String,
  }],
  invoiceId: {
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
  about: {
    type: String,
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
  isEmployeeSpecial: {
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
  questionnaire: {
    type: mongoose.Schema.ObjectId,
    ref: "Questionnaire",
  },
  register: {
    type: String,
  },
  token: {
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
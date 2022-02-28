const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ProfileSchema = new mongoose.Schema({
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
  },
  name: {
      type: String,
      required: [true, "Ажил олгогчийн нэрийг оруулна уу"]
  },
  isEmployer: {
    type: Boolean
  },
  isEmployee: {
    type: Boolean
  },
  photo: {
    type: String,
    default: null
  },
  invoiceId: {
    type: String,
    default: null
  },
  qrImage: {
    type: String,
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
  location: {
    type: String,
  },
  register: {
    type: String,
  },
  about: {
    type: String,
  },
  organization: {
    type: Boolean,
    default: false,
  },
  authentication: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    minlength: 4,
    required: [true, "Нууц үгээ оруулна уу"],
    select: false,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  filter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Filter',
    default: null
  },
  job: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    default: null
  }],
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
  point: {
    type: Number,
    default: 0
  },
  wallet: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});

ProfileSchema.pre("save", async function (next) {
  // Нууц үг өөрчлөгдөөгүй бол дараачийн middleware рүү шилж
  if (!this.isModified("password")) next();

  // Нууц үг өөрчлөгдсөн
  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

ProfileSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRESIN,
    }
  );

  return token;
};

ProfileSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

ProfileSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(3).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Profile", ProfileSchema);

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
      required: [true, "Нэр оруулна уу"]
  },
  birth: {
    type: Date
  },
  profile: {
    type: String,
  },
  cover: {
    type: String,
  },
  location: {
    type: String,
  },
  humanId: {
    type: String,
  },
  about: {
    type: String,
  },
  authentication: {
    type: Boolean,
    default: false,
  },
  working: {
    type: Boolean,
    default: false,
  },
  workingCompany: {
    type: mongoose.Schema.ObjectId,
    ref: 'Profile',
  },
  status: {
    type: String,
    enum: ["opentowork"]
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
    type: String
  },
  category: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  }],
  experience: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Experience',
  }],
  course: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
  }],
  comment: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  }],
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
  follower: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  }],
  post: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  }],
  likePost: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
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
});

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
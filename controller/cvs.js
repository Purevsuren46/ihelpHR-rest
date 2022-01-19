const Cv = require("../models/Cv");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

// логин хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  // Оролтыгоо шалгана

  if (!phone || !password) {
    throw new MyError("Утас болон нууц үгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const cv = await Cv.findOne({ phone }).select("+password");

  if (!cv) {
    throw new MyError("Утасны дугаар болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await cv.checkPassword(password);

  if (!ok) {
    throw new MyError("Утасны дугаар болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = cv.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    cv: cv,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

exports.getCvs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Cv);

  const cvs = await Cv.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: cvs,
    pagination,
  });
});

exports.getCv = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.params.id);

  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.createCv = asyncHandler(async (req, res, next) => {
  const cv = await Cv.create(req.body);

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.updateCv = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.deleteCv = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.params.id);

  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  cv.remove();

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу", 400);
  }

  const cv = await Cv.findOne({ email: req.body.email });

  if (!cv) {
    throw new MyError(req.body.email + " имэйлтэй хэрэглэгч олдсонгүй!", 400);
  }

  const resetToken = cv.generatePasswordChangeToken();
  await cv.save();

  // await cv.save({ validateBeforeSave: false });

  // Имэйл илгээнэ
  const link = `${resetToken}`;

  const message = `Сайн байна уу<br><br>Таны хүсэлтийг илгээлээ.<br> Нууц үг өөрчлөх код:<br><br>${link}<br><br>Өдрийг сайхан өнгөрүүлээрэй!`;

  const info = await sendEmail({
    email: cv.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message,
  });

  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    success: true,
    resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та токен болон нууц үгээ дамжуулна уу", 400);
  }

  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const cv = await Cv.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!cv) {
    throw new MyError("Токен хүчингүй байна!", 400);
  }

  cv.password = req.body.password;
  cv.resetPasswordToken = undefined;
  cv.resetPasswordExpire = undefined;
  await cv.save();

  const token = cv.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    cv: cv,
  });
});
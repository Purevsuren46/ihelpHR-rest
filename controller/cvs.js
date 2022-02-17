const Cv = require("../models/Cv");
const Profile = require("../models/Profile");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");

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

exports.getAuthCvs = asyncHandler(async (req, res, next) => {

  req.query.authPhoto = {$ne: null};
  req.query.isApproved = true;
  req.query.authentication = false;
  return this.getCvs(req, res, next);
});


exports.getCvFollower = asyncHandler(async (req, res, next) => {

  req.query.follower = req.params.id;
  return this.getCvs(req, res, next);
});

exports.getCvFollowing = asyncHandler(async (req, res, next) => {

  req.query.following = req.params.id;
  return this.getCvs(req, res, next);
});

exports.followCv = asyncHandler(async (req, res, next) => {
  const cvs = await Cv.findById(req.params.id);
  const cv = await Cv.findById(req.userId);

  if (!cvs) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  cv.following.addToSet(req.params.id);
  cvs.follower.addToSet(req.userId);
  cv.save()
  cvs.save()

  res.status(200).json({
    success: true,
    data: cv
  });
});

exports.unfollowCv = asyncHandler(async (req, res, next) => {
  const cvs = await Cv.findById(req.params.id);
  const cv = await Cv.findById(req.userId);

  if (!cvs) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  cv.following.remove(req.params.id);
  cvs.follower.remove(req.userId);
  cv.save()
  cvs.save()

  res.status(200).json({
    success: true,
    data: cv
  });
});

exports.chargePoint = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);

  if(!req.body.point) {
    throw new MyError(" Point хэмжээ оруулна уу?", 400);
  }

  if(cv.point < req.body.point) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    cv.point += req.body.point
    cv.wallet -= req.body.point * 1000
  }

  cv.save()

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.settingProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  // if(!req.body.special) {
  //   throw new MyError(" Special төрлөө сонгоно уу?", 400);
  // }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  console.log(req.body.special !== undefined)
  if (req.body.special !== undefined) {
    if(profile.special < Date.now() ) {
      const date = new Date()
      profile.special = date.addDays(req.body.special) 
      profile.isSpecial = true
  } else {
      let date = profile.special
      profile.special = date.addDays(req.body.special)
      profile.isSpecial = true
  }
  } else if (req.body.cv !== undefined) {
    if(profile.cvList < Date.now() ) {
      const date = new Date()
      profile.cvList = date.addDays(req.body.cv) 
      profile.isCvList = true
    } else {
      let date = profile.cvList
      profile.cvList = date.addDays(req.body.cv)
      profile.isCvList = true
    }
  } else if (req.body.urgent !== undefined) {
    if(profile.urgent < Date.now() ) {
      const date = new Date()
      profile.urgent = date.addDays(req.body.urgent) 
      profile.isUrgent = true
  } else {
      let date = profile.urgent
      profile.urgent = date.addDays(req.body.urgent)
      profile.isUrgent = true
  }
  } else {next()}

  

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.cvList = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.cv) {
    throw new MyError(" Анкет сан үзэх хугацаагаа сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.cvList < Date.now() ) {
    const date = new Date()
    profile.cvList = date.addDays(req.body.cv) 
    profile.isCvList = true
} else {
    let date = profile.cvList
    profile.cvList = date.addDays(req.body.cv)
    profile.isCvList = true
}

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.urgentProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.urgent) {
    throw new MyError(" Urgent төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.urgent < Date.now() ) {
    const date = new Date()
    profile.urgent = date.addDays(req.body.urgent) 
    profile.isUrgent = true
} else {
    let date = profile.urgent
    profile.urgent = date.addDays(req.body.urgent)
    profile.isUrgent = true
}

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
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

  if (req.userId == req.params.id || req.userRole == "admin") {
    res.status(200).json({
      success: true,
      data: cv,
    });
  } else {
    throw new MyError ("Засах боломжгүй", 400)
  }

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

// PUT: api/v1/cvs/:id/profile
exports.uploadCvProfile = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);

  if (!cv) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `profile_${req.userId}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: 300}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.profile.push(file.name);
    cv.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});

// PUT: api/v1/cvs/:id/cover
exports.uploadCvCover = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);

  if (!cv) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `cover_${req.userId}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: 300}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.cover = file.name;
    cv.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});

// PUT: api/v1/cvs/:id/auth-photo
exports.uploadCvAuth = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);

  if (!cv) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `auth_${req.userId}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: 300}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.authPhoto = file.name;
    cv.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});
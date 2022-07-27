const Profile = require("../models/Profile");
const Category = require("../models/Category");
const Apply = require("../models/Apply");
const Follow = require("../models/Follow");
const Wallet = require("../models/Wallet");
const Cv = require("../models/Cv");
const History = require("../models/History");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const axios = require('axios');



// логин хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Оролтыгоо шалгана

  if (!email || !password) {
    throw new MyError("Email болон нууц үгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const profile = await Cv.findOne({ email }).select("+password");

  if (!profile) {
    throw new MyError("Email болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await profile.checkPassword(password);

  if (!ok) {
    throw new MyError("Email болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = profile.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    profile: profile,
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

exports.getProfiles = asyncHandler(async (req, res, next) => {
  console.time("getProfiles")
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;
  req.query.organization = true;
  
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  

  // const follows = await Follow.find({createUser: req.userId})
  // const user = []
  // for (let i = 0; i < (follows.length); i++ ) {
  //   user.push(follows[i].followUser.toString())
  // }

  // for (let i = 0; i < profiles.length; i++) {
  //   if (user.includes(profiles[i]._id.toString()) ) {
  //     profiles[i].isFollowing = true
  //   } 
  // }

  // const applies = await Apply.find({createUser: req.userId})
  // const apply = []
  // for (let i = 0; i < (applies.length); i++ ) {
  //   apply.push(applies[i].company.toString())
  // }

  // for (let i = 0; i < profiles.length; i++) {
  //   if (apply.includes(profiles[i]._id.toString()) ) {
  //     profiles[i].isSentCv = true
  //   } 
  // }


  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
  console.timeEnd("getProfiles")
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const profile = await Cv.findById(req.params.id, select)

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  // const follow = await Follow.find({createUser: req.userId})
  // const follo = []
  // for (let i = 0; i < follow.length; i++) {
  //   follo.push(follow[i].followUser.toString())
  // }


  // if (follo.includes(profile._id.toString())) {
  //   profile.isFollowing = true
  // } else {
  //   profile.isFollowing = false
  // }
  


  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.getSpecialEmployeeProfiles = asyncHandler(async (req, res, next) => {
  req.query.employeeSpecial = {$gt: Date.now()}
  req.query.isEmployee = true
  return this.getProfiles(req, res, next);
});

exports.getSpecialEmployerProfiles = asyncHandler(async (req, res, next) => {
  req.query.employerSpecial = {$gt: Date.now()}
  req.query.isEmployer = true
  return this.getProfiles(req, res, next);
});

exports.getUnspecialEmployeeProfiles = asyncHandler(async (req, res, next) => {
  req.query.employeeSpecial = {$lt: Date.now()}
  req.query.isEmployee = true
  return this.getProfiles(req, res, next);
});

exports.getUnspecialEmployerProfiles = asyncHandler(async (req, res, next) => {
  req.query.employerSpecial = {$lt: Date.now()}
  req.query.isEmployer = true
  return this.getProfiles(req, res, next);
});

exports.specialEmployerProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.employerSpecial) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }


  if (req.body.employerSpecial != undefined) {
    if (profile.point < req.body.employerSpecial) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
      if (profile.employerSpecial < Date.now()) {
        if (req.body.employerSpecial == 30) {
          profile.point -= 100
          profile.employerSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 90) {
        profile.point -= 250
        profile.employerSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 180) {
        profile.point -= 400
        profile.employerSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 365) {
        profile.point -= 600
        profile.employerSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } 
      } else {
        if (req.body.employerSpecial == 30) {
          profile.point -= 100
          profile.employerSpecial = profile.employerSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 90) {
          profile.point -= 250
          profile.employerSpecial = profile.employerSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 180) {
          profile.point -= 400
          profile.employerSpecial = profile.employerSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
      } else if (req.body.employerSpecial == 365) {
        profile.point -= 600
        profile.employerSpecial = profile.employerSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employerSpecial
    } 
      }
    }
    } 

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.specialEmployeeProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.employeeSpecial) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }


  if (req.body.employeeSpecial != undefined) {
    if (profile.point < req.body.employeeSpecial) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
      if (profile.employeeSpecial < Date.now()) {
        if (req.body.employeeSpecial == 30) {
          profile.point -= 100
          profile.employeeSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 90) {
        profile.point -= 250
        profile.employeeSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 180) {
        profile.point -= 400
        profile.employeeSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 365) {
        profile.point -= 600
        profile.employeeSpecial = Date.now() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } 
      } else {
        if (req.body.employeeSpecial == 30) {
          profile.point -= 100
          profile.employeeSpecial = profile.employeeSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 90) {
          profile.point -= 250
          profile.employeeSpecial = profile.employeeSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 180) {
          profile.point -= 400
          profile.employeeSpecial = profile.employeeSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
      } else if (req.body.employeeSpecial == 365) {
        profile.point -= 600
        profile.employeeSpecial = profile.employeeSpecial.getTime() + 60 * 60 * 1000 * 24 * req.body.employeeSpecial
    } 
      }
    }
    } 

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.chargePoint = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if(!req.body.point) {
    throw new MyError(" Point хэмжээ оруулна уу?", 400);
  }

  if(profile.point < req.body.point) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    profile.point += req.body.point
    profile.wallet -= req.body.point * 1000
  }

  profile.save()

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  req.body.wallet = 0,
  req.body.point = 0,
  req.body.organization = true
  const profile = await Cv.create(req.body);
  if(req.body.category) {
    const category = await Category.findById(req.body.category)
    profile.categoryName = category.name
    profile.save()
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const cvv = await Cv.findById(req.params.id);
  const profile = await Cv.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  if (req.userRole == "user") {
    profile.wallet = cvv.wallet,
    profile.point = cvv.point,
    profile.role = "user",
    profile.employeeSpecial = cvv.employeeSpecial,
    profile.employerSpecial = cvv.employerSpecial,
    profile.isEmployeeSpecial = cvv.isEmployeeSpecial,
    profile.isEmployerSpecial = cvv.isEmployerSpecial,
    profile.employeeUrgent = cvv.employeeUrgent,
    profile.employerUrgent = cvv.employerUrgent,
    profile.isEmployeeUrgent = cvv.isEmployeeUrgent,
    profile.isEmployerUrgent = cvv.isEmployerUrgent,
    profile.cvList = cvv.cvList,
    profile.isCvList = cvv.isCvList
    profile.save()
  }
  if (req.userId == req.params.id || req.userRole == "admin") {
    req.body.updateByUser = req.userId;
    req.body.updateUser = req.params.id;
    const history = await History.create(req.body)
    res.status(200).json({
      success: true,
      data: profile,
    });
  } else {
    throw new MyError ("Засах боломжгүй", 400)
  }

});

exports.deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  profile.remove();

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу", 400);
  }

  const profile = await Cv.findOne({ email: req.body.email });

  if (!profile) {
    throw new MyError(req.body.email + " имэйлтэй хэрэглэгч олдсонгүй!", 400);
  }

  const resetToken = profile.generatePasswordChangeToken();
  await profile.save();

  // await profile.save({ validateBeforeSave: false });

  // Имэйл илгээнэ
  const link = `${resetToken}`;

  const message = `Сайн байна уу<br><br>Таны хүсэлтийг илгээлээ.<br> Нууц үг өөрчлөх код:<br><br>${link}<br><br>Өдрийг сайхан өнгөрүүлээрэй!`;

  const info = await sendEmail({
    email: profile.email,
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

  const profile = await Cv.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!profile) {
    throw new MyError("Токен хүчингүй байна!", 400);
  }

  profile.password = req.body.password;
  profile.resetPasswordToken = undefined;
  profile.resetPasswordExpire = undefined;
  await profile.save();

  const token = profile.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    profile: profile,
  });
});

exports.uploadProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

  if (!profile) {
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

  file.name = `profile_${req.params.id}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    profile.profile = file.name;
    profile.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});

// PUT: api/v1/profiles/:id/cover
exports.uploadCover = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

  if (!profile) {
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

  file.name = `cover_${req.params.id}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    profile.cover = file.name;
    profile.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});
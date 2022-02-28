const Cv = require("../models/Cv");
const History = require("../models/History");
const Profile = require("../models/Profile");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios")

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
// logout хийнэ
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
// Хэрэглэгчид авах
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
// Хэрэглэгчийг iD гаар авна
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
// Үнэмлэхний зургаа явуулцан, гэрээгээ зөвшөөрцөн хэрэглэгчдийг авах
exports.getAuthCvs = asyncHandler(async (req, res, next) => {

  req.query.authPhoto = {$ne: null};
  req.query.isApproved = true;
  req.query.authentication = false;
  return this.getCvs(req, res, next);
});
// Дагагчдийг авах
exports.getCvFollower = asyncHandler(async (req, res, next) => {

  req.query.follower = req.params.id;
  return this.getCvs(req, res, next);
});
// Дагадаг хэрэглэгдчийг авах
exports.getCvFollowing = asyncHandler(async (req, res, next) => {

  req.query.following = req.params.id;
  return this.getCvs(req, res, next);
});
// Хэрэглэгч дагах 
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
// Хэрэглэгч дагахаа болих
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
// Wallet оос Point шилжүүлэх
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
// Company urgent, special, cvlist өгөх 
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
// Wallet цэнэглэх хүсэлт
exports.invoiceWallet = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.params.id);

  await axios({
    method: 'post',
    url: 'https://merchant.qpay.mn/v2/auth/token',
    headers: {
      Authorization: `Basic SUhFTFA6NXNEdkVRazM=`
    },

  }).then(response => {
    const token = response.data.access_token;

    axios({
      method: 'post',
      url: 'https://merchant.qpay.mn/v2/invoice',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        invoice_code: "IHELP_INVOICE",
        sender_invoice_no: "12345678",
        invoice_receiver_code: `${cv.phone}`,
        invoice_description:`iHelp wallet charge ${cv.email}`,
        
        amount:req.body.amount,
        callback_url:`http://128.199.128.37/api/v1/cvs/callbacks/${req.params.id}`
      }
    }).then(response => {
      cv.qrImage = response.data.qr_image
      cv.invoiceId = response.data.invoice_id
      cv.save()
    })
    .catch(error => {
      console.log(error.response.data);
    });
  })
  .catch(error => {
    console.log(error.response.data);
  });

  res.status(200).json({
    success: true,
  });
});
// Wallet цэнэглэх 
exports.chargeWallet = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.params.id);
  const charge = req.query

  await axios({
    method: 'post',
    url: 'https://merchant.qpay.mn/v2/auth/token',
    headers: {
      Authorization: `Basic SUhFTFA6NXNEdkVRazM=`
    },

  }).then(response => {
    const token = response.data.access_token;

    axios({
      method: 'post',
      url: 'https://merchant.qpay.mn/v2/payment/check',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        object_type: "INVOICE",
        object_id  : `${cv.invoiceId}`,
        offset     : {
            page_number: 1,
            page_limit : 100
          }
      }
    }).then(response => {
      cv.qrImage = null
      cv.wallet += response.data.paid_amount
      cv.save()
    })
    .catch(error => {
      console.log(error.response.data);
    });
  })
  .catch(error => {
    console.log(error.response.data);
  });


  res.status(200).json({
    success: true,
    data: cv
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
// шинээр хэрэглэгч үүсгэх
exports.createCv = asyncHandler(async (req, res, next) => {
  req.body.wallet = 0,
  req.body.point = 0
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
  console.log(req.params.id, req.userId, req.body, req._startTime )
  if (req.userId == req.params.id) {
    cv.wallet = 0,
    cv.point = 0
    cv.save()
  }
  if (req.userId == req.params.id || req.userRole == "admin") {
    req.body.updateByUser = req.userId;
    req.body.updateUser = req.params.id;
    const history = await History.create(req.body)
    res.status(200).json({
      success: true,
      data: cv,
    });
  } else {
    throw new MyError ("Засах боломжгүй", 400)
  }

});
// хэрэглэгч засах, history д хадгалах
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
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.profile = file.name;
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
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
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
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.authPhoto = file.name;
    cv.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  
});

exports.uploadCvPortfolio = asyncHandler(async (req, res, next) => {
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

  file.name = `portfolio_${req.userId}_${cv.portfolio.length}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.portfolio.addToSet(file.name);
    cv.save();

    res.status(200).json({
      success: true,
      data: cv
    });
  
});
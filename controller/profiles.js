const Profile = require("../models/Profile");
const Cv = require("../models/Cv");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const axios = require('axios');

// register
exports.register = asyncHandler(async (req, res, next) => {
  const profile = await Profile.create(req.body);

  const token = profile.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    profile: profile,
  });
});

// логин хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Оролтыгоо шалгана

  if (!email || !password) {
    throw new MyError("Email болон нууц үгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const profile = await Profile.findOne({ email }).select("+password");

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Profile.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if (profile.special > String(Date.now())) {
    profile.isSpecial = true
  } else {
    profile.isSpecial = false
  }

  if (profile.urgent > String(Date.now())) {
    profile.isUrgent = true
  } else {
    profile.isUrgent = false
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.getSpecialProfiles = asyncHandler(async (req, res, next) => {
  req.query.isSpecial = true;
  return this.getProfiles(req, res, next);
});

exports.getUrgentProfiles = asyncHandler(async (req, res, next) => {
  req.query.isUrgent = true;
  return this.getProfiles(req, res, next);
});

exports.getCvListProfiles = asyncHandler(async (req, res, next) => {
  req.query.isCvList = true;
  return this.getProfiles(req, res, next);
});

exports.specialProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.special) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.special) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.special < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.special
        profile.special = date.addDays(req.body.special) 
        profile.isSpecial = true
    } else {
        let date = profile.special
        profile.point -= req.body.special
        profile.special = date.addDays(req.body.special)
        profile.isSpecial = true
    }
  }

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.cvList = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.userId);

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

  if(profile.point < req.body.cv) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.cvList < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.cv
        profile.cvList = date.addDays(req.body.cv) 
        profile.isCvList = true
    } else {
        let date = profile.cvList
        profile.point -= req.body.cv
        profile.cvList = date.addDays(req.body.cv)
        profile.isCvList = true
    }
  }

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.urgentProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.userId);

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

  if(profile.point < req.body.urgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.urgent < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.urgent
        profile.urgent = date.addDays(req.body.urgent) 
        profile.isUrgent = true
    } else {
        let date = profile.urgent
        profile.point -= req.body.urgent
        profile.urgent = date.addDays(req.body.urgent)
        profile.isUrgent = true
    }
  }

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.chargePoint = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.userId);

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

exports.invoiceWallet = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

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
        invoice_receiver_code: `${profile.phone}`,
        invoice_description:`iHelp wallet charge ${profile.email}`,
        
        amount:req.body.amount,
        callback_url:`http://128.199.128.37/api/v1/profiles/callbacks/${req.params.id}`
      }
    }).then(response => {
      profile.qrImage = response.data.qr_image
      profile.invoiceId = response.data.invoice_id
      profile.save()
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

exports.chargeWallet = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);
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
        object_id  : `${profile.invoiceId}`,
        offset     : {
            page_number: 1,
            page_limit : 100
          }
      }
    }).then(response => {
      profile.qrImage = null
      profile.wallet += response.data.paid_amount
      profile.save()
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
    data: profile
  });
});

exports.followProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);
  const cv = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  cv.following.addToSet(req.params.id);
  profile.follower.addToSet(req.userId);
  cv.save()
  profile.save()

  res.status(200).json({
    success: true,
    data: cv
  });
});

exports.unfollowProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);
  const cv = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  cv.following.remove(req.params.id);
  profile.follower.remove(req.userId);
  cv.save()
  profile.save()

  res.status(200).json({
    success: true,
    data: cv
  });
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  req.body.wallet = 0,
  req.body.point = 0
  const profile = await Profile.create(req.body);

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  
  const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  if (req.userId == req.params.id) {
    profile.wallet = 0,
    profile.point = 0
    profile.save()
  }
  if (req.userId == req.params.id || req.userRole == "admin") {
    res.status(200).json({
      success: true,
      data: profile,
    });
  } else {
    throw new MyError ("Засах боломжгүй", 400)
  }

});

exports.deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

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

  const profile = await Profile.findOne({ email: req.body.email });

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

  const profile = await Profile.findOne({
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
  const profile = await Profile.findById(req.params.id);

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
  const profile = await Profile.findById(req.params.id);

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
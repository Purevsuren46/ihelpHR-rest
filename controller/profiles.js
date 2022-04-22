const Profile = require("../models/Profile");
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

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  });

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if (profile.employeeSpecial > String(Date.now())) {
    profile.isEmployeeSpecial = true
  } else {
    profile.isEmployeeSpecial = false
  }

  if (profile.employerSpecial > String(Date.now())) {
    profile.isEmployerSpecial = true
  } else {
    profile.isEmployerSpecial = false
  }

  if (profile.employeeUrgent > String(Date.now())) {
    profile.isEmployeeUrgent = true
  } else {
    profile.isEmployeeUrgent = false
  }

  if (profile.employerUrgent > String(Date.now())) {
    profile.isEmployerUrgent = true
  } else {
    profile.isEmployerUrgent = false
  }

  if (profile.cvList > String(Date.now())) {
    profile.isCvList = true
  } else {
    profile.isCvList = false
  }
  

  profile.save()

  res.status(200).json({
    success: true,
    data: profile,
  });
});

exports.getSpecialEmployeeProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployeeSpecial = true;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getSpecialEmployerProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployerSpecial = true;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getUnspecialEmployeeProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployeeSpecial = false;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getUnspecialEmployerProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployerSpecial = false;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getUrgentEmployeeProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployeeUrgent = true;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getUrgentEmployerProfiles = asyncHandler(async (req, res, next) => {
  req.query.isEmployerUrgent = true;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate({
    path: 'job',
    populate: { path: 'occupation', select: 'name' }
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.getCvListProfiles = asyncHandler(async (req, res, next) => {
  req.query.isCvList = true;
  req.query.organization = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Profile);

  const profiles = await Cv.find(req.query, select).populate("job")
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: profiles,
    pagination,
  });
});

exports.specialEmployerProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.employerSpecial) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.employerSpecial) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.employerSpecial < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.employerSpecial
        profile.employerSpecial = date.addDays(req.body.employerSpecial) 
        profile.isEmployerSpecial = true
    } else {
        let date = profile.employerSpecial
        profile.point -= req.body.employerSpecial
        profile.employerSpecial = date.addDays(req.body.employerSpecial)
        profile.isEmployerSpecial = true
    }
  }
  profile.save()
  const expire = setTimeout(() => {profile.isEmployerSpecial = false, profile.save()}, Math.abs(Number(profile.employerSpecial) - Date.now()))

  

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

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.employeeSpecial) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.employeeSpecial < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.employeeSpecial
        profile.employeeSpecial = date.addDays(req.body.employeeSpecial) 
        profile.isEmployeeSpecial = true
    } else {
        let date = profile.employeeSpecial
        profile.point -= req.body.employeeSpecial
        profile.employeeSpecial = date.addDays(req.body.employeeSpecial)
        profile.isEmployeeSpecial = true
    }
  }
  const expire = setTimeout(() => {profile.isEmployeeSpecial = false, profile.save()}, Math.abs(Number(profile.employeeSpecial) - Date.now()))

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.cvList = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

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
  const expire = setTimeout(() => {profile.isCvList = false, profile.save()}, Math.abs(Number(profile.cvList) - Date.now()))

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.urgentEmployerProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.employerUrgent) {
    throw new MyError(" Urgent төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.employerUrgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.employerUrgent < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.employerUrgent
        profile.employerUrgent = date.addDays(req.body.employerUrgent) 
        profile.isEmployerUrgent = true
    } else {
        let date = profile.employerUrgent
        profile.point -= req.body.employerUrgent
        profile.employerUrgent = date.addDays(req.body.employerUrgent)
        profile.isEmployerUrgent = true
    }
  }
  const expire = setTimeout(() => {profile.isEmployerUrgent = false, profile.save()}, Math.abs(Number(profile.employerUrgent) - Date.now()))

  profile.save()

  res.status(200).json({
    success: true,
    profile: profile
  });
});

exports.urgentEmployeeProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.userId);

  if (!profile) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.employeeUrgent) {
    throw new MyError(" Urgent төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.employeeUrgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(profile.employeeUrgent < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.employeeUrgent
        profile.employeeUrgent = date.addDays(req.body.employeeUrgent) 
        profile.isEmployeeUrgent = true
    } else {
        let date = profile.employeeUrgent
        profile.point -= req.body.employeeUrgent
        profile.employeeUrgent = date.addDays(req.body.employeeUrgent)
        profile.isEmployeeUrgent = true
    }
  }
  const expire = setTimeout(() => {profile.isEmployeeUrgent = false, profile.save()}, Math.abs(Number(profile.employeeUrgent) - Date.now()))

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

exports.invoiceWallet = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

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
        invoice_description:`ihelp Wallet charge ${profile.phone}`,
        
        amount: req.body.amount,
        callback_url: `http://128.199.128.37/api/v1/profiles/callbacks/${req.params.id}`
      }
    }).then(async (response) => {
      req.body.urls = response.data.urls
      req.body.qrImage = response.data.qr_image
      req.body.invoiceId = response.data.invoice_id
      const wallet = await Wallet.create(req.body)
      profile.invoiceId = wallet._id
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
  const profile = await Cv.findById(req.params.id);
  const wallet = await Wallet.findById(profile.invoiceId);

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
        object_id  : `${wallet.invoiceId}`,
        offset     : {
            page_number: 1,
            page_limit : 100
          }
      }
    }).then(response => {
      wallet.qrImage = null
      wallet.save()
      profile.point += (response.data.paid_amount / 1000)
      profile.save()
      res.status(200).json({
        success: true,
      });
    })
    .catch(error => {
      console.log(error.response.data);
    });
  })
  .catch(error => {
    console.log(error.response.data);
  });



});

exports.followProfile = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);
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
  const profile = await Cv.findById(req.params.id);
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
  req.body.point = 0,
  req.body.organization = true
  const profile = await Cv.create(req.body);

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
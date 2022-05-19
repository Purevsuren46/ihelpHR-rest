const Cv = require("../models/Cv");
const Transaction = require("../models/Transaction");
const Questionnaire = require("../models/Questionnaire");
const Follow = require("../models/Follow");
const Phone = require("../models/Phone");
const Wallet = require("../models/Wallet");
const History = require("../models/History");
const Profile = require("../models/Profile");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const mongoose = require('mongoose');
const Activity = require('../models/Activity')
const Expo = require("expo-server-sdk").Expo


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
  if (req.body.expoPushToken) {
    cv.expoPushToken = req.body.expoPushToken
    cv.save()
  }

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
  const cv = await Cv.findById(req.params.id)

  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if (cv.special > String(Date.now())) {
    cv.isSpecial = true
  } else {
    cv.isSpecial = false
  }

  if (cv.urgent > String(Date.now())) {
    cv.isUrgent = true
  } else {
    cv.isUrgent = false
  }

  if (cv.cvList > String(Date.now())) {
    cv.isCvList = true
  } else {
    cv.isCvList = false
  }
  

  cv.save()

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.getCvActivity = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Cv);
 req.query.createUser = req.userId

  const cvs = await Activity.find(req.query, select).populate("postId jobId followId")
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: cvs,
    pagination,
  });
});
// Үнэмлэхний зургаа явуулцан, гэрээгээ зөвшөөрцөн хэрэглэгчдийг авах
exports.getAuthCvs = asyncHandler(async (req, res, next) => {

  req.query.authPhoto = {$ne: null};
  req.query.isApproved = true;
  req.query.authentication = false;
  return this.getCvs(req, res, next);
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
  const profile = await Cv.findById(req.params.id);

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
        invoice_description:`ihelp wallet charge ${profile.email}`,
        
        amount:req.body.amount,
        callback_url:`http://128.199.128.37/api/v1/cvs/callbacks/${req.params.id}/${req.body.amount}`
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
  // const wallet = await Wallet.findById(profile.invoiceId)
  // const charge = req.query
  // console.log(charge.qpay_payment_id)
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  let messages = [];
  if (!Expo.isExpoPushToken(profile.expoPushToken)) {
      console.error(`Push token ${profile.expoPushToken} is not a valid Expo push token`);
  }
  messages.push({
      to: profile.expoPushToken,
      sound: 'default',
      body: `${(req.params.numId / 1000)} Point-оор цэнэглэгдлээ`,
      data: { data: "notification._id" },
    })
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          // console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();
    profile.point += (req.params.numId / 1000)
    profile.save()
    req.body.point = req.params.numId
    req.body.createUser = req.params.id
    const transaction = await Transaction.create(req.body);


  res.status(200).json({
    success: true,
    data: profile,
    transaction: transaction
  });
});

exports.chargeSocial = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findOne({transactionId: req.body.transactionId});
  // const wallet = await Wallet.findById(profile.invoiceId)
  // const charge = req.query
  // console.log(charge.qpay_payment_id)
  if (!profile) {
    throw new MyError(" Хэрэглэгч байхгүй!", 400);
  }
  if (req.body.errorDesc == "Амжилттай") {
    let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  let messages = [];
  if (!Expo.isExpoPushToken(profile.expoPushToken)) {
      console.error(`Push token ${profile.expoPushToken} is not a valid Expo push token`);
  }
  messages.push({
      to: profile.expoPushToken,
      sound: 'default',
      body: `${(req.body.amount / 1000)} Point-оор цэнэглэгдлээ`,
      data: { data: "notification._id" },
    })
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          // console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();
    profile.point += (req.body.amount / 1000)
    profile.save()
    req.body.point = req.body.amount
    req.body.createUser = profile._id
    const transaction = await Transaction.create(req.body);


  res.status(200).json({
    success: true,
    data: profile,
    transaction: transaction
  });
  } else {
    throw new MyError(" Амжилтгүй", 400);
  }
  
});

exports.invoiceSocialpay = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

  var val = Math.floor(100000000000 + Math.random() * 900000000000);

  function hmac256(key, message) {
    let hash = crypto.createHmac("sha256", key).update(message);
    return hash.digest("hex");
  }
  const check = hmac256("esx@bo#Dv88#3tJ)", `${val}${req.body.amount}GEThttp://128.199.128.37/api/v1/cvs/callbacks/${req.params.id}/${req.body.amount}`)

  await axios({
    method: 'post',
    url: 'https://ecommerce.golomtbank.com/api/invoice',
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJNRVJDSEFOVF9OT1ZFTElTVF9MTEMiLCJpYXQiOjE2NTIwNTk5NzB9.gGrMufT6mnGKxv3O5vjQs4qNjOqIwclswGMffnAcX9w`
    },
    data: {
      amount: `${req.body.amount}`,
      callback: `http://128.199.128.37/api/v1/cvs/callbacks/${req.params.id}/${req.body.amount}`,
      checksum: `${check}`,
      genToken: "Y",
      returnType: "GET",
      transactionId: `${val}`
    }

  }).then(response => {
    profile.transactionId = response.data.transactionId
    profile.invoiceSocialId = response.data.invoice
    profile.save()
  })
  .catch(error => {
    console.log(error.response.data);
  });


  res.status(200).json({
    success: true,
  });
});

exports.cvList = asyncHandler(async (req, res, next) => {
  const profile = await Cv.findById(req.params.id);

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
  const profile = await Cv.findById(req.params.id);

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

  const random = await Phone.findOne({random: req.body.random})
  if (random == null) {
    throw new MyError("Мессежний код буруу байна", 400)
  } else {
    req.body.phone = random.phone
    req.body.wallet = 0,
    req.body.point = 0,
    req.body.role = "user"
    const posts = await Cv.create(req.body);
    const rando = await Phone.deleteOne({random: req.body.random})

    const post = await Cv.findById("6268f4795c8249342cd4ed22")
    post.follower += 1
    post.save()
    posts.following += 1
    posts.save()
    req.body.createUser = posts._id;
    req.body.followUser = "6268f4795c8249342cd4ed22";
const follow = await Follow.create(req.body);
req.body.createUser = posts._id;
const questionnaire = await Questionnaire.create(req.body);
    res.status(200).json({
      success: true,
      data: posts,
    });
  }

});

exports.updateCv = asyncHandler(async (req, res, next) => {
  const cvv = await Cv.findById(req.params.id);
  const cv = await Cv.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });


  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  if (req.userRole == "user") {
    cv.wallet = cvv.wallet,
    cv.point = cvv.point,
    cv.role = "user",
    cv.special = cvv.special,
    cv.cvList = cvv.cvList,
    cv.isSpecial = cvv.isSpecial,
    cv.isCvList = cvv.isCvList
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
  const ques = await Questionnaire.findOne({createUser: req.params.id});

  if (!cv) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  ques.remove()
  cv.remove();

  res.status(200).json({
    success: true,
    data: cv,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.phone) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу", 400);
  }

  const cv = await Cv.findOne({ phone: req.body.phone });

  if (!cv) {
    throw new MyError(req.body.phone + " утастай хэрэглэгч олдсонгүй!", 400);
  }

  const resetToken = cv.generatePasswordChangeToken();
  await cv.save();

  // await cv.save({ validateBeforeSave: false });

  // Имэйл илгээнэ
  const link = `${resetToken}`;

  const message = `Нууц үг өөрчлөх код: ${link}`;
  const param = encodeURI(message)

  // const info = await sendEmail({
  //   email: cv.email,
  //   subject: "Нууц үг өөрчлөх хүсэлт",
  //   message,
  // });

    await axios({
    method: "get",
    url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&from=72773055&to=${req.body.phone}&text=${param}`
  })

  res.status(200).json({
    success: true,
  });
});

exports.changePhoneRequest = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findOne({phone: req.body.phone})
  const phon = await Phone.findOne({phone: req.body.phone})

  if (cv == null) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const params = `from=72773055&to=${req.body.phone}&text=Таны бүртгэл үүсгэх нууц код ${random}`
    const param = encodeURI(params)
    await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&${param}`
    })
  req.body.random = random
  
  } else {
    throw new MyError("Утас бүртгүүлсэн байна", 400)
  }

  if (phon == null) {
    const phone = await Phone.create(req.body)
    res.status(200).json({
      success: true,
    });
  } else {
    phon.random = req.body.random
    phon.save()
    res.status(200).json({
      success: true,
    });
  }
  
});

exports.changePhone = asyncHandler(async (req, res, next) => {

  const random = await Phone.findOne({random: req.body.random})
  if (random == null) {
    throw new MyError("Мессежний код буруу байна", 400)
  } else {
  const cv = await Cv.findOne({phone: random.phone})
    cv.phone = random.newPhone
    cv.save()
    const rando = await Phone.deleteOne({random: req.body.random})

    
    res.status(200).json({
      success: true,
      data: cv,
    });
  }

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

exports.sendPhone = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findOne({phone: req.body.phone})
  const phon = await Phone.findOne({phone: req.body.phone})

  if (cv == null) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const params = `from=72773055&to=${req.body.phone}&text=Таны бүртгэл үүсгэх нууц код ${random}`
    const param = encodeURI(params)
    await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&${param}`
    })
  req.body.random = random
  
  } else {
    throw new MyError("Утас бүртгүүлсэн байна", 400)
  }

  if (phon == null) {
    const phone = await Phone.create(req.body)
    res.status(200).json({
      success: true,
    });
  } else {
    phon.random = req.body.random
    phon.save()
    res.status(200).json({
      success: true,
    });
  }
  
});

exports.authPhone = asyncHandler(async (req, res, next) => {
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
  if (cv.profile == "ihelp.jpg" ) {
    
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
  
  } else {
    fs.unlinkSync(`${process.env.FILE_UPLOAD_PATH}/${cv.profile}`)
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
  
  }



  // image upload
  
});

// PUT: api/v1/cvs/:id/cover
exports.uploadCvCover = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);
  if (!cv) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }
  if (cv.cover == "cover.jpg" ) {
    
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
  } else {
    fs.unlinkSync(`${process.env.FILE_UPLOAD_PATH}/${cv.cover}`)
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
  }
});

// PUT: api/v1/cvs/:id/auth-photo
exports.uploadCvAuth = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId);
  if (cv.authPhoto != null ) {
    fs.unlinkSync(`${process.env.FILE_UPLOAD_PATH}/${cv.authPhoto}`)
  }

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

    if (req.files.file1 != undefined) {
      const file1 = req.files.file1;
  
    file1.name = `portfolio_${req.userId}_image1${path.parse(file1.name).ext}`;
    
    const picture = await sharp(file1.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file1.name}`);
    
      cv.portfolio.image1 = file1.name;
    }

    if (req.files.file2 != undefined) {
      const file2 = req.files.file2;
  
    file2.name = `portfolio_${req.userId}_image2${path.parse(file2.name).ext}`;
    
    const picture = await sharp(file2.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file2.name}`);
    
      cv.portfolio.image2 = file2.name;
    }

    if (req.files.file3 != undefined) {
      const file3 = req.files.file3;
  
    file3.name = `portfolio_${req.userId}_image3${path.parse(file3.name).ext}`;
    
    const picture = await sharp(file3.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file3.name}`);
    
      cv.portfolio.image3 = file3.name;
    }

    if (req.files.file4 != undefined) {
      const file4 = req.files.file4;
  
    file4.name = `portfolio_${req.userId}_image4${path.parse(file4.name).ext}`;
    
    const picture = await sharp(file4.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file4.name}`);
    
      cv.portfolio.image4 = file4.name;
    }

    if (req.files.file5 != undefined) {
      const file5 = req.files.file5;
  
    file5.name = `portfolio_${req.userId}_image5${path.parse(file5.name).ext}`;
    
    const picture = await sharp(file5.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file5.name}`);
    
      cv.portfolio.image5 = file5.name;
    }

    if (req.files.file6 != undefined) {
      const file6 = req.files.file6;
  
    file6.name = `portfolio_${req.userId}_image6${path.parse(file6.name).ext}`;
    
    const picture = await sharp(file6.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file6.name}`);
    
      cv.portfolio.image6 = file6.name;
    }

    cv.save()
    
    res.status(200).json({
      success: true,
      data: cv
    });
  
});
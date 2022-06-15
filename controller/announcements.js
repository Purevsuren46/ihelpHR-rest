const Announcement = require("../models/Announcement");
const Apply = require("../models/Apply");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const Profile = require("../models/Profile");
const Occupation = require("../models/Occupation");
const Questionnaire = require("../models/Questionnaire");
const Cv = require("../models/Cv");
const Activity = require('../models/Activity')
const Transaction = require('../models/Transaction')
const queryString = require('query-string');

exports.getSpecialAnnouncements = asyncHandler(async (req, res, next) => {
  req.query.special = {$gt: Date.now()}
  return this.getAnnouncements(req, res, next);
});

exports.getUrgentAnnouncements = asyncHandler(async (req, res, next) => {
  req.query.urgent = {$gt: Date.now()}
  return this.getAnnouncements(req, res, next);
});

exports.getUnspecialAnnouncements = asyncHandler(async (req, res, next) => {
  req.query.special = {$lt: Date.now()}
  req.query.urgent = {$lt: Date.now()}
  return this.getAnnouncements(req, res, next);
});

// api/v1/Announcements
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Announcement);

  const announcements = await Announcement.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'profile lastName firstName'
  })
  .sort({isUrgent:-1})  
  .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});
  if (questionnaire == null) {
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
      pagination,
    });
  } else {
    const sendsCv = await Apply.find({createUser: req.userId, announcement: {$ne: null} });
  const announcementsId = []
  for (let i = 0; i < sendsCv.length; i++) {
    announcementsId.push(sendsCv[i].announcement.toString())
  }
  for (let i = 0; i < announcements.length; i++) {
    if (announcementsId.includes(announcements[i]._id.toString()) ) {
      announcements[i].isSentCv = true
    } 
  }
  const age = Math.floor(Math.abs(new Date(Date.now()) - questionnaire.birth) / 1000 / 60 / 60 / 24 / 365)
  const percent = 10
  const gender = questionnaire.gender
  const education = questionnaire.education
  const experience = questionnaire.experiences
  const occupation = questionnaire.occupation
  const level = questionnaire.level
  const type = questionnaire.type
  for (let i = 0; i < announcements.length; i++) {
    if (announcements[i].age == "18-25" && age >= 18 && age <= 25) {
      announcements[i].percent += percent
    } else if (announcements[i].age == "26-30" && age >= 26 && age <= 30) {
      announcements[i].percent += percent
    } else if (announcements[i].age == "31-36" && age >= 31 && age <= 36) {
      announcements[i].percent += percent
    } else if (announcements[i].age == "37-45" && age >= 37 && age <= 45) {
      announcements[i].percent += percent
    } else if (announcements[i].age == "45+" && age >= 45) {
      announcements[i].percent += percent
    } else if (announcements[i].age == "хамаагүй") {
      announcements[i].percent += percent
    }

    if (announcements[i].gender == "хоёул") {
      announcements[i].percent += percent
    } else if (announcements[i].gender == gender) {
      announcements[i].percent += percent
    } 

    if (announcements[i].education == education) {
      announcements[i].percent += percent
    }

    if (announcements[i].experience == "0-1" && experience >= 0 && experience <= 1) {
      announcements[i].percent += percent
    } else if (announcements[i].experience == "1-3" && experience > 1 && experience <= 3) {
      announcements[i].percent += percent
    } else if (announcements[i].experience == "3-5" && experience > 3 && experience <= 5) {
      announcements[i].percent += percent
    } else if (announcements[i].experience == "5-10" && experience > 5 && experience <= 10) {
      announcements[i].percent += percent
    } else if (announcements[i].experience == "10+" && experience > 10) {
      announcements[i].percent += percent
    } else if (announcements[i].experience == "хамаагүй") {
      announcements[i].percent += percent
    }

    if (announcements[i].occupation == occupation) {
      announcements[i].percent += percent
    }

    if (announcements[i].level == level) {
      announcements[i].percent += percent
    }
    if (announcements[i].type == type) {
      announcements[i].percent += percent
    }
    if (announcements[i].salary == questionnaire.salary) {
      announcements[i].percent += percent
    }

  }



  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements,
    pagination,
  });
  }
  
});

exports.getProfileAnnouncements = asyncHandler(async (req, res, next) => {

  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Announcement);

  const announcements = await Announcement.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'firstName profile'
  })
  .sort({isUrgent:-1})  
  .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
      pagination,
    });
});

// api/v1/categories/:catId/Announcements
exports.getOccupationAnnouncements = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Announcement);

  //req.query, select
  const announcements = await Announcement.find(
    { ...req.query, occupation: req.params.occupationId },
    select
  )
  .populate("occupation").populate({
    path: 'createUser',
    select: 'firstName profile'
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements,
    pagination,
  });
});

exports.getCvFilterAnnouncements = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});
  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  if (questionnaire.category !== null) {
    const occupation = await Occupation.find({category: questionnaire.category})
    const occu = []
    for (let i = 0; i < (occupation.length); i++ ) {
      occu.push(occupation[i]._id)
    }
    req.query.occupation = occu
  }
  if (questionnaire.salary !== null) {
    const salary = ["400,000 - 600,000", "600,000 - 800,000", "800,000 - 1,000,000", "1,000,000 - 1,200,000", "1,200,000 - 1,500,000", "1,500,000 - 1,800,000", "1,800,000 - 2,100,000", "2,100,000 - 2,500,000", "2,500,000 - 3,000,000", "3,000,000 - 4,000,000", "4,000,000 - 5,000,000", "5,000,000 -аас дээш"]
    const index = salary.indexOf(questionnaire.salary)
    const sala = []
    for (let i = index; i < (salary.length); i++ ) {
      sala.push(salary[i])
    }
    req.query.salary = sala
  }
  return this.getAnnouncements(req, res, next);
});

exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id).populate("occupation").populate({
    path: 'createUser',
    select: "category name profile announcementNumber firstName",
    populate: {path: "category", select: "name"}
  })


  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (announcement.special > String(Date.now())) {
    announcement.isSpecial = true
  } else {
    announcement.isSpecial = false
  }

  if (announcement.urgent > String(Date.now())) {
    announcement.isUrgent = true
  } else {
    announcement.isUrgent = false
  }

  // Хандалт тоологч
  if (announcement.count == null) {
      // default data
      const beginCount = new Announcement({
          count : 1
      })
      beginCount.save()
  }
  else {
      announcement.count += 1;
      announcement.save()
  }

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

exports.specialAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  const profile = await Cv.findById(req.userId);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.special) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }

  if (req.body.special != undefined) {
    if (profile.point < req.body.special) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
      if (announcement.special < Date.now()) {
        if (req.body.special == 7) {
          profile.point -= 20
          announcement.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 14) {
        profile.point -= 30
        announcement.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 30) {
        profile.point -= 40
        announcement.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } 
      } else {
        if (req.body.special == 7) {
          profile.point -= 20
          announcement.special = announcement.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 14) {
          profile.point -= 30
          announcement.special = announcement.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 30) {
          profile.point -= 40
          announcement.special = announcement.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } 
      }
    }
    const profil = await Cv.findById(req.userId);
    req.body.firstPoint = profil.point
    req.body.point = profile.point - profil.point
    req.body.announcement = req.params.id
    req.body.createUser = req.userId
    req.body.explanation = "ажил хайх онцлох болгов"
    const transaction = await Transaction.create(req.body);

    } 

  profile.save()
  announcement.save()

  res.status(200).json({
    success: true,
    data: announcement,
    profile: profile
  });
});

exports.urgentAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  const profile = await Cv.findById(req.userId);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.urgent) {
    throw new MyError(" Urgent төрлөө сонгоно уу?", 400);
  }

  if(profile.point < req.body.urgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(announcement.urgent < Date.now() ) {
        profile.point -= req.body.urgent
        announcement.urgent = Date.now() + 60 * 60 * 1000 * 24 * req.body.urgent
    } else {
        profile.point -= req.body.urgent
        announcement.urgent = announcement.urgent.getTime() + 60 * 60 * 1000 * 24 * req.body.urgent
    }

    const profil = await Cv.findById(req.userId);
    req.body.firstPoint = profil.point
    req.body.point = profile.point - profil.point
    req.body.announcement = req.params.id
    req.body.createUser = req.userId
    req.body.explanation = "ажил хайх яаралтай болгов"
    const transaction = await Transaction.create(req.body);
  }

  profile.save()
  announcement.save()

  res.status(200).json({
    success: true,
    data: announcement,
    profile: profile
  });
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  const announcementCat = await Cv.create(req.body);

  res.status(200).json({
    success: true,
    data: announcementCat,
  });
});


exports.evalCand = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ажил байхгүй!", 400);
  }
  const candCheck = announcement.apply.includes(req.body.candidate);
  if (candCheck == false) {
    console.log(announcement.score)
    announcement.score[0]._id
    .addToSet(req.body.candidate)
    console.log(announcement.score[0]._id)
    // announcement.score[2].hrPoint[1] = req.userId
    // announcement.score.hrPoint.score = req.body.score

  } else {
    console.log(req.body)
    announcement.score.hrPoint = req.body.hrPoint
  }
  announcement.save()

  res.status(200).json({
    success: true,
    data: announcement
  });
});

exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const occupation = await Occupation.findById(req.body.occupation);
  const profile = await Cv.findById(req.userId);

  
  if (!occupation) {
    throw new MyError(req.body.occupation + " ID-тэй мэргэжил байхгүй!", 400);
  }

  if (req.body.urgent != undefined) {
    if (profile.point < req.body.urgent) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
        profile.point -= req.body.urgent
        req.body.urgent = Date.now() + 60 * 60 * 1000 * 24 * req.body.urgent
    }
  } 

  if (req.body.order != undefined) {
    if (profile.point < req.body.order) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else if (req.body.order == 30) {
        profile.point -= 10
        req.body.order = Date.now() + 60 * 60 * 1000 * 24 * req.body.order
    } else {
      profile.point -= req.body.order
      req.body.order = Date.now() + 60 * 60 * 1000 * 24 * req.body.order
    }
  } 



  if (req.body.special != undefined) {
    if (profile.point < req.body.special) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else if (req.body.special == 7) {
        const date = new Date()
        profile.point -= 20
        req.body.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
    } else if (req.body.special == 14) {
      const date = new Date()
      profile.point -= 30
      req.body.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
    } else if (req.body.special == 30) {
      const date = new Date()
      profile.point -= 40
      req.body.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
    } 
    } 

  
  profile.announcementNumber += 1
  
  req.body.createUser = req.userId;
  const announcement = await Announcement.create(req.body);
  req.body.createUser = req.userId
  req.body.type = "Announcement"
  req.body.crud = "Create"
  req.body.announcementId = announcement._id
  const activity = await Activity.create(req.body)
  const profil = await Cv.findById(req.userId);
  req.body.firstPoint = profil.point
  req.body.point = profile.point - profil.point
  req.body.createUser = req.userId
  req.body.explanation = "ажил хайх үүсгэв"
  req.body.announcement = announcement._id
  const transaction = await Transaction.create(req.body);
  profile.save()
  res.status(200).json({
    success: true,
    data: announcement,
    profile: profile,
    transaction: transaction
  });
});

exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (
  //   announcement.createProfile !== req.userId || req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  const user = await Cv.findById(req.userId);

  announcement.remove();
  res.status(200).json({
    success: true,
    data: announcement,
    whoDeleted: user.firstName,
  });
});

exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  // if (
  //   announcement.createProfile.toString() !== req.userId &&
  //   req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  req.body.updateProfile = req.userId;

  for (let attr in req.body) {
    announcement[attr] = req.body[attr];
  }

  announcement.save();

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

// PUT:  api/v1/Announcements/:id/photo
exports.uploadAnnouncementPhoto = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(
        "Файлыг хуулах явцад алдаа гарлаа. Алдаа : " + err.message,
        400
      );
    }

    announcement.photo = file.name;
    announcement.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});


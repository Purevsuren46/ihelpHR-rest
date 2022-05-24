const Job = require("../models/Job");
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
const queryString = require('query-string');

exports.getSpecialJobs = asyncHandler(async (req, res, next) => {
  req.query.special = {$gt: Date.now()}
  return this.getJobs(req, res, next);
});

exports.getUrgentJobs = asyncHandler(async (req, res, next) => {
  req.query.urgent = {$gt: Date.now()}
  return this.getJobs(req, res, next);
});

exports.getUnspecialJobs = asyncHandler(async (req, res, next) => {
  req.query.special = {$lt: Date.now()}
  req.query.urgent = {$lt: Date.now()}
  return this.getJobs(req, res, next);
});

// api/v1/Jobs
exports.getJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);

  const jobs = await Job.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  })
  .sort({isUrgent:-1})  
  .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});
  if (questionnaire == null) {
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      pagination,
    });
  } else {
    const sendsCv = await Apply.find({createUser: req.userId, job: {$ne: null} });
  const jobsId = []
  for (let i = 0; i < sendsCv.length; i++) {
    jobsId.push(sendsCv[i].job.toString())
  }
  for (let i = 0; i < jobs.length; i++) {
    if (jobsId.includes(jobs[i]._id.toString()) ) {
      jobs[i].isSentCv = true
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
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].age == "18-25" && age >= 18 && age <= 25) {
      jobs[i].percent += percent
    } else if (jobs[i].age == "26-30" && age >= 26 && age <= 30) {
      jobs[i].percent += percent
    } else if (jobs[i].age == "31-36" && age >= 31 && age <= 36) {
      jobs[i].percent += percent
    } else if (jobs[i].age == "37-45" && age >= 37 && age <= 45) {
      jobs[i].percent += percent
    } else if (jobs[i].age == "45+" && age >= 45) {
      jobs[i].percent += percent
    } else if (jobs[i].age == "хамаагүй") {
      jobs[i].percent += percent
    }

    if (jobs[i].gender == "хоёул") {
      jobs[i].percent += percent
    } else if (jobs[i].gender == gender) {
      jobs[i].percent += percent
    } 

    if (jobs[i].education == education) {
      jobs[i].percent += percent
    }

    if (jobs[i].experience == "0-1" && experience >= 0 && experience <= 1) {
      jobs[i].percent += percent
    } else if (jobs[i].experience == "1-3" && experience > 1 && experience <= 3) {
      jobs[i].percent += percent
    } else if (jobs[i].experience == "3-5" && experience > 3 && experience <= 5) {
      jobs[i].percent += percent
    } else if (jobs[i].experience == "5-10" && experience > 5 && experience <= 10) {
      jobs[i].percent += percent
    } else if (jobs[i].experience == "10+" && experience > 10) {
      jobs[i].percent += percent
    } else if (jobs[i].experience == "хамаагүй") {
      jobs[i].percent += percent
    }

    if (jobs[i].occupation == occupation) {
      jobs[i].percent += percent
    }

    if (jobs[i].level == level) {
      jobs[i].percent += percent
    }
    if (jobs[i].type == type) {
      jobs[i].percent += percent
    }
    if (jobs[i].salary == questionnaire.salary) {
      jobs[i].percent += percent
    }

  }

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
    pagination,
  });
  }
  
});

exports.getProfileJobs = asyncHandler(async (req, res, next) => {

  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);

  const jobs = await Job.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  })
  .sort({isUrgent:-1})  
  .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      pagination,
    });
});

// api/v1/categories/:catId/Jobs
exports.getOccupationJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);

  //req.query, select
  const jobs = await Job.find(
    { ...req.query, occupation: req.params.occupationId },
    select
  )
  .populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
    pagination,
  });
});

exports.getCvFilterJobs = asyncHandler(async (req, res, next) => {
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
  return this.getJobs(req, res, next);
});

exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate("occupation").populate({
    path: 'createUser',
    select: "category name profile jobNumber",
    populate: {path: "category", select: "name"}
  })


  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (job.special > String(Date.now())) {
    job.isSpecial = true
  } else {
    job.isSpecial = false
  }

  if (job.urgent > String(Date.now())) {
    job.isUrgent = true
  } else {
    job.isUrgent = false
  }

  // Хандалт тоологч
  if (job.count == null) {
      // default data
      const beginCount = new Job({
          count : 1
      })
      beginCount.save()
  }
  else {
      job.count += 1;
      job.save()
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

exports.specialJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  const profile = await Cv.findById(req.userId);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.special) {
    throw new MyError(" Special төрлөө сонгоно уу?", 400);
  }

  if (req.body.special != undefined) {
    if (profile.point < req.body.special) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
      if (job.special < Date.now()) {
        if (req.body.special == 7) {
          profile.point -= 20
          job.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 14) {
        profile.point -= 30
        job.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 30) {
        profile.point -= 40
        job.special = Date.now() + 60 * 60 * 1000 * 24 * req.body.special
      } 
      } else {
        if (req.body.special == 7) {
          profile.point -= 20
          job.special = job.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 14) {
          profile.point -= 30
          job.special = job.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } else if (req.body.special == 30) {
          profile.point -= 40
          job.special = job.special.getTime() + 60 * 60 * 1000 * 24 * req.body.special
      } 
      }
    }
    

    } 

  profile.save()
  job.save()

  res.status(200).json({
    success: true,
    data: job,
    profile: profile
  });
});

exports.urgentJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  const profile = await Cv.findById(req.userId);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.urgent) {
    throw new MyError(" Urgent төрлөө сонгоно уу?", 400);
  }

  if(profile.point < req.body.urgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(job.urgent < Date.now() ) {
        profile.point -= req.body.urgent
        job.urgent = Date.now() + 60 * 60 * 1000 * 24 * req.body.urgent
    } else {
        profile.point -= req.body.urgent
        job.urgent = job.urgent.getTime() + 60 * 60 * 1000 * 24 * req.body.urgent
    }
  }

  profile.save()
  job.save()

  res.status(200).json({
    success: true,
    data: job,
    profile: profile
  });
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  const jobCat = await Cv.create(req.body);

  res.status(200).json({
    success: true,
    data: jobCat,
  });
});


exports.evalCand = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ажил байхгүй!", 400);
  }
  const candCheck = job.apply.includes(req.body.candidate);
  if (candCheck == false) {
    console.log(job.score)
    job.score[0]._id
    .addToSet(req.body.candidate)
    console.log(job.score[0]._id)
    // job.score[2].hrPoint[1] = req.userId
    // job.score.hrPoint.score = req.body.score

  } else {
    console.log(req.body)
    job.score.hrPoint = req.body.hrPoint
  }
  job.save()

  res.status(200).json({
    success: true,
    data: job
  });
});

exports.createJob = asyncHandler(async (req, res, next) => {
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

  
  profile.jobNumber += 1
  profile.save()
  req.body.createUser = req.userId;
  const job = await Job.create(req.body);
  req.body.createUser = req.userId
  req.body.type = "Job"
  req.body.crud = "create"
  req.body.jobId = job._id
  const activity = await Activity.create(req.body)
  res.status(200).json({
    success: true,
    data: job,
    profile: profile
  });
});

exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  const cv = await Cv.findById(req.userId);
  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (
  //   job.createProfile !== req.userId || req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  const user = await Cv.findById(req.userId);

  job.remove();
  cv.job.remove(req.params.id);
  cv.save()
  res.status(200).json({
    success: true,
    data: job,
    whoDeleted: user.name,
  });
});

exports.updateJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  // if (
  //   job.createProfile.toString() !== req.userId &&
  //   req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  req.body.updateProfile = req.userId;

  for (let attr in req.body) {
    job[attr] = req.body[attr];
  }

  job.save();

  res.status(200).json({
    success: true,
    data: job,
  });
});

// PUT:  api/v1/Jobs/:id/photo
exports.uploadJobPhoto = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
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

    job.photo = file.name;
    job.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});


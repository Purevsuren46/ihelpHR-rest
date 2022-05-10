const Job = require("../models/Job");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const Profile = require("../models/Profile");
const Occupation = require("../models/Occupation");
const Questionnaire = require("../models/Questionnaire");
const Cv = require("../models/Cv");
const queryString = require('query-string');

exports.getSpecialJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);
  req.query.isSpecial = true
  
  const jobs = await Job.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  }) 
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  

    // const docs = await Job.aggregate(
    //   [{$match: {special: {$gt: String(Date.now())}}}]
    // );

  // if (jobs.special < Date.now()) {
  //   continue;
  // }
  // console.log()
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
    pagination,
  });
});

exports.getUrgentJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);
  req.query.isUrgent = true
  
  const jobs = await Job.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  }) 
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  

    // const docs = await Job.aggregate(
    //   [{$match: {special: {$gt: String(Date.now())}}}]
    // );

  // if (jobs.special < Date.now()) {
  //   continue;
  // }
  // console.log()
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
    pagination,
  });
});

exports.getUnspecialJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job.find({isSpecial: false, isUrgent: false}));
  req.query.isSpecial = false
  req.query.isUrgent = false
  
  const jobs = await Job.find(req.query, select).populate("occupation").populate({
    path: 'createUser',
    select: 'name profile'
  }) 
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  

    // const docs = await Job.aggregate(
    //   [{$match: {special: {$gt: String(Date.now())}}}]
    // );

  // if (jobs.special < Date.now()) {
  //   continue;
  // }
  // console.log()
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
    pagination,
  });
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
    select: 'name profile'
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

exports.likeJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  job.like.addToSet(req.userId);
  job.save()

  res.status(200).json({
    success: true,
    data: job
  });
});

exports.unlikeJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  job.like.remove(req.userId);
  job.save()

  res.status(200).json({
    success: true,
    data: job
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

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if (req.body.special != undefined) {
    if (profile.point < req.body.special) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else if (req.body.special == 7) {
        const date = new Date()
        profile.point -= 20
        job.special = date.addDays(req.body.special)
        job.isSpecial = true
    } else if (req.body.special == 14) {
      const date = new Date()
      profile.point -= 30
      job.special = date.addDays(req.body.special)
      job.isSpecial = true
    } else if (req.body.special == 30) {
      const date = new Date()
      profile.point -= 40
      job.special = date.addDays(req.body.special)
      job.isSpecial = true
    } 
    } 
  // const expire = setTimeout(() => {job.isSpecial = false, job.save()}, Math.abs(Number(job.special) - Date.now()))

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

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(profile.point < req.body.urgent) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(job.urgent < Date.now() ) {
        const date = new Date()
        profile.point -= req.body.urgent
        job.urgent = date.addDays(req.body.urgent) 
        job.isUrgent = true
    } else {
        let date = job.urgent
        profile.point -= req.body.urgent
        job.urgent = date.addDays(req.body.urgent)
        job.isUrgent = true
    }
  }
  // const expire = setTimeout(() => {job.isUrgent = false, job.save()}, Math.abs(Number(job.urgent) - Date.now()))

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

exports.applyJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ажил байхгүй!", 400);
  }
  job.apply.addToSet(req.userId);
  job.save()

  res.status(200).json({
    success: true,
    data: job
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

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  if (req.body.urgent != undefined) {
    if (profile.point < req.body.urgent) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else {
        const date = new Date()
        profile.point -= req.body.urgent
        req.body.urgent = date.addDays(req.body.urgent)
        req.body.isUrgent = true
    }
  } 

  if (req.body.order != undefined) {
    if (profile.point < req.body.order) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else if (req.body.order == 30) {
        const date = new Date()
        profile.point -= 10
        req.body.order = date.addDays(30)
    } else {
      const date = new Date()
      profile.point -= req.body.order
      req.body.order = date.addDays(req.body.order)
    }
  } 



  if (req.body.special != undefined) {
    if (profile.point < req.body.special) {
      throw new MyError(" Point оноо хүрэхгүй байна", 400);
    } else if (req.body.special == 7) {
        const date = new Date()
        profile.point -= 20
        req.body.special = date.addDays(req.body.special)
        req.body.isSpecial = true
    } else if (req.body.special == 14) {
      const date = new Date()
      profile.point -= 30
      req.body.special += date.addDays(req.body.special)
      req.body.isSpecial = true
    } else if (req.body.special == 30) {
      const date = new Date()
      profile.point -= 40
      req.body.special = date.addDays(req.body.special)
      req.body.isSpecial = true
    } 
    } 


  // if(profile.point < req.body.special + req.body.urgent + req.body.order) {
  //   throw new MyError(" Point оноо хүрэхгүй байна", 400);
  // } else {
  //   const date = new Date()
  //   profile.point -= req.body.order
  //   req.body.order = date.addDays(req.body.order)
    
  //   const date1 = new Date()
  //   profile.point -= req.body.urgent
  //   req.body.isUrgent = true
  //   req.body.urgent = date1.addDays(req.body.urgent)
  
  //   const date2 = new Date()
  //   profile.point -= req.body.special
  //   req.body.isSpecial = true
  //   req.body.special = date2.addDays(req.body.special)
  // }
  
  profile.jobNumber += 1
  profile.save()
  req.body.createUser = req.userId;
  const job = await Job.create(req.body);
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


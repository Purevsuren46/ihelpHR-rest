const Job = require("../models/Job");
const path = require("path");

const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const Profile = require("../models/Profile");
const Occupation = require("../models/Occupation");

// api/v1/Jobs
exports.getJobs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Job);

  const jobs = await Job.find(req.query, select)
    .populate({
      path: "jobCat",
      select: "name ",
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

exports.getProfileJobs = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getJobs(req, res, next);
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

exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
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

exports.createProfile = asyncHandler(async (req, res, next) => {
  const jobCat = await Profile.create(req.body);

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

exports.createJob = asyncHandler(async (req, res, next) => {
  const occupation = await Occupation.findById(req.body.occupation);
  const profile = await Profile.findById(req.userId);

  
  if (!occupation) {
    throw new MyError(req.body.occupation + " ID-тэй мэргэжил байхгүй!", 400);
  }

  req.body.createUser = req.userId;
  const job = await Job.create(req.body);
  // profile.job.addToSet(req.body.createUser);
  // profile.save()
  console.log(req)
  res.status(200).json({
    success: true,
    data: job,
  });
});

exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (
    job.createProfile.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await Profile.findById(req.userId);

  job.remove();

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

  if (
    job.createProfile.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

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

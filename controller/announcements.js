const Announcement = require("../models/Announcement");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const Profile = require("../models/Profile");
const Occupation = require("../models/Occupation");

// api/v1/Announcements
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Announcement);

  const announcements = await Announcement.find(req.query, select)
    .populate({
      path: "announcementCat",
      select: "name ",
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

exports.getProfileAnnouncements = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getAnnouncements(req, res, next);
});

// api/v1/occupations/:catId/Announcements
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

exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
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

exports.createProfile = asyncHandler(async (req, res, next) => {
  const announcementCat = await Profile.create(req.body);

  res.status(200).json({
    success: true,
    data: announcementCat,
  });
});

exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const occupation = await Occupation.findById(req.body.occupation);

  if (!occupation) {
    throw new MyError(req.body.occupation + " ID-тэй категори байхгүй!", 400);
  }

  req.body.createUser = req.userId;

  const announcement = await Announcement.create(req.body);

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (
    announcement.createProfile.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await Profile.findById(req.userId);

  announcement.remove();

  res.status(200).json({
    success: true,
    data: announcement,
    whoDeleted: user.name,
  });
});

exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (
    announcement.createProfile.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

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
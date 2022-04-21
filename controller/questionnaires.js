const Questionnaire = require("../models/Questionnaire");
const Cv = require("../models/Cv");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");



// Хэрэглэгчид авах
exports.getQuestionnaires = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Questionnaire);

  const questionnaires = await Questionnaire.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: questionnaires,
    pagination,
  });
});
// Хэрэглэгчийг iD гаар авна
exports.getQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.params.id});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});
// шинээр хэрэглэгч үүсгэх
exports.createQuestionnaire = asyncHandler(async (req, res, next) => {
  const ques = await Questionnaire.findOne({createUser: req.userId, })
  if (ques == null) {
    const cv = await Cv.findById(req.userId);
    req.body.createUser = req.userId;
    req.body.firstName = cv.firstName;
    req.body.lastName = cv.lastName;
    const questionnaire = await Questionnaire.create(req.body);
    res.status(200).json({
      success: true,
      data: questionnaire,
    });
  } else {
    throw new MyError(" Хэрэглэгч анкет бүртгүүлсэн байна", 400);
  }

});

exports.updateQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOneAndUpdate({createUser: req.params.id}, req.body, {
    new: true,
    runValidators: true,
  });


  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  res.status(200).json({ success: true, data: questionnaire, })

});
// хэрэглэгч засах, history д хадгалах
exports.deleteQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findById(req.params.id);

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.remove();

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.createFamilyQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.family.push(req.body)
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.deleteFamilyQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.family.pull({_id: req.params.id})
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.createExperienceQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.experience.push(req.body)
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.deleteExperienceQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.experience.pull({_id: req.params.id})
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.createCourseQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.course.push(req.body)
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.deleteCourseQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.course.pull({_id: req.params.id})
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.createAchievementQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(" ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.achievement.push(req.body)
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.deleteAchievementQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  questionnaire.achievement.pull({_id: req.params.id})
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});
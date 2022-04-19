const Questionnaire = require("../models/Questionnaire");
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
  const questionnaire = await Questionnaire.findById(req.params.id).populate("experience post course");

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
  req.query.createUser = req.userId;
  const questionnaire = await Questionnaire.create(req.body);
  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.updateQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnairev = await Questionnaire.findById(req.params.id);
  const questionnaire = await Questionnaire.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });


  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

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

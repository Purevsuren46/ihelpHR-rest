const Questionnaire = require("../models/Questionnaire");
const Cv = require("../models/Cv");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");



// Хэрэглэгчид авах
exports.getQuestionnaires = asyncHandler(async (req, res, next) => {
  const cv = await Cv.findById(req.userId)
  if (cv.point < 1000) {
    throw new MyError("Хэрэглэгчийн point 1000 аас дээш байж анкет сан үзэх боломжтой", 400);
  }
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
  if (questionnaire.birth != null) {
    questionnaire.score += 10
  }
  if (questionnaire.location != null) {
    questionnaire.score += 10
  }
  if (questionnaire.birthPlace != null) {
    questionnaire.score += 10
  }
  if (questionnaire.phoneEmergency != null) {
    questionnaire.score += 10
  }
  if (questionnaire.profession != null) {
    questionnaire.score += 10
  }
  if (questionnaire.register != null) {
    questionnaire.score += 10
  }
  if (questionnaire.education != null) {
    questionnaire.score += 10
  }
  if (questionnaire.experiences != null) {
    questionnaire.score += 10
  }
  if (questionnaire.course.length > 0) {
    questionnaire.score += 10
  }
  if (questionnaire.experience.length > 0) {
    questionnaire.score += 10
  }
  if (questionnaire.achievement.length > 0) {
    questionnaire.score += 10
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
    if(questionnaire.profession != null) {
      cv.profession = questionnaire.profession
    }
    if(questionnaire.workingCompany != null) {
      cv.workingCompany = questionnaire.workingCompany
    }
    cv.save()
    res.status(200).json({
      success: true,
      data: questionnaire,
    });
  } else {
    const quest = await Questionnaire.findOneAndUpdate({createUser: req.userId}, req.body, {
      new: true,
      runValidators: true,
    })
    const cv = await Cv.findById(req.userId);
    if(quest.profession != null) {
      cv.profession = quest.profession
    }
    if(quest.firstName != null) {
      cv.firstName = quest.firstName
    }
    if(quest.lastName != null) {
      cv.lastName = quest.lastName
    }
    if(quest.workingCompany != null) {
      cv.workingCompany = quest.workingCompany
    }
    cv.save()
    res.status(200).json({
      success: true,
      data: quest,
    });
  }

});

exports.updateQuestionnaire = asyncHandler(async (req, res, next) => {
  const quest = await Questionnaire.findOneAndUpdate({createUser: req.params.id}, req.body, {
    new: true,
    runValidators: true,
  });
  const cv = await Cv.findById(req.userId);
  if(quest.firstName != null) {
    cv.firstName = quest.firstName
  }
  if(quest.lastName != null) {
    cv.lastName = quest.lastName
  }
  if(quest.profession != null) {
    cv.profession = quest.profession
  }
  if(quest.workingCompany != null) {
    cv.workingCompany = quest.workingCompany
  }
  if(quest.status != null) {
    cv.status = quest.status
  }
  cv.save()


  if (!quest) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }
  res.status(200).json({ success: true, data: quest, })

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

exports.updateFamilyQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  
  const number = questionnaire.family.findIndex((obj => obj._id == req.params.id))
  questionnaire.family[number] = req.body
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

exports.updateExperienceQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  
  const number = questionnaire.experience.findIndex((obj => obj._id == req.params.id))
  questionnaire.experience[number] = req.body
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

exports.updateCourseQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  
  const number = questionnaire.course.findIndex((obj => obj._id == req.params.id))
  questionnaire.course[number] = req.body
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

exports.updateAchievementQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.userId});

  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  
  const number = questionnaire.achievement.findIndex((obj => obj._id == req.params.id))
  questionnaire.achievement[number] = req.body
  questionnaire.save()

  res.status(200).json({
    success: true,
    data: questionnaire,
  });
});

exports.getCvQuestionnaire = asyncHandler(async (req, res, next) => {
  const questionnaire = await Questionnaire.findOne({createUser: req.params.id});
  if (!questionnaire) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  let link = "http://128.199.128.37/api/v1/jobs"
  if (questionnaire.category !== null) {
     link += `?category=${questionnaire.category}`
  }
  if (questionnaire.salary !== null) {
    link += `&salary=${questionnaire.salary}`
  }
  if (questionnaire.type !== null) {
    link += `&type=${questionnaire.type}`
  }
  if (questionnaire.location !== null) {
    link += `&location=${questionnaire.location}`
  }
// api/v1/jobs?category=61dfcc1792241041a49e811f&salary="2,100,000 - 2,500,000"&type="Бүтэн цагийн"
res.status(200).json({
  success: true,
  data: link,
});


});
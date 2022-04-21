const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  createFamilyQuestionnaire,
  deleteFamilyQuestionnaire,
  createCourseQuestionnaire,
  deleteCourseQuestionnaire,
  createAchievementQuestionnaire,
  deleteAchievementQuestionnaire,
  createExperienceQuestionnaire,
  deleteExperienceQuestionnaire,
} = require("../controller/questionnaires");

// api/v1/questionnaires/:id/books
// const { getQuestionnaireJobs } = require("../controller/jobs");
// const { getQuestionnaireAnnouncements } = require("../controller/announcements");
// router.route("/:questionnaireId/Jobs").get(getQuestionnaireJobs);
// router.route("/:questionnaireId/Announcements").get(getQuestionnaireAnnouncements);

//"/api/v1/questionnaires"

router
  .route("/:id/family")
  .delete(protect, deleteFamilyQuestionnaire);
router
  .route("/family")
  .post(protect, createFamilyQuestionnaire);
router
  .route("/:id/achievement")
  .delete(protect, deleteAchievementQuestionnaire);
router
  .route("/achievement")
  .post(protect, createAchievementQuestionnaire);
router
  .route("/:id/course")
  .delete(protect, deleteCourseQuestionnaire);
router
  .route("/course")
  .post(protect, createCourseQuestionnaire);
router
  .route("/:id/experience")
  .delete(protect, deleteExperienceQuestionnaire);
router
  .route("/experience")
  .post(protect, createExperienceQuestionnaire);
  
router
  .route("/")
  .get(getQuestionnaires).post(protect, createQuestionnaire);
router
  .route("/:id")
  .get(getQuestionnaire)
  .post(protect, updateQuestionnaire)
  .delete(protect, deleteQuestionnaire);

module.exports = router;
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getQuestionnaires,
  getQuestionnaire,
  getCvQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  createFamilyQuestionnaire,
  deleteFamilyQuestionnaire,
  updateFamilyQuestionnaire,
  createCourseQuestionnaire,
  deleteCourseQuestionnaire,
  updateCourseQuestionnaire,
  createAchievementQuestionnaire,
  deleteAchievementQuestionnaire,
  updateAchievementQuestionnaire,
  createExperienceQuestionnaire,
  deleteExperienceQuestionnaire,
  updateExperienceQuestionnaire,
} = require("../controller/questionnaires");

// api/v1/questionnaires/:id/books
// const { getQuestionnaireJobs } = require("../controller/jobs");
// const { getQuestionnaireAnnouncements } = require("../controller/announcements");
// router.route("/:questionnaireId/Jobs").get(getQuestionnaireJobs);
// router.route("/:questionnaireId/Announcements").get(getQuestionnaireAnnouncements);

//"/api/v1/questionnaires"

router
  .route("/:id/family")
  .delete(protect, deleteFamilyQuestionnaire)
  .put(protect, updateFamilyQuestionnaire);
router
  .route("/family")
  .post(protect, createFamilyQuestionnaire);
router
  .route("/:id/achievement")
  .delete(protect, deleteAchievementQuestionnaire)
  .put(protect, updateAchievementQuestionnaire);
router
  .route("/achievement")
  .post(protect, createAchievementQuestionnaire);
router
  .route("/:id/course")
  .delete(protect, deleteCourseQuestionnaire)
  .put(protect, updateCourseQuestionnaire);
router
  .route("/course")
  .post(protect, createCourseQuestionnaire);
router
  .route("/:id/experience")
  .delete(protect, deleteExperienceQuestionnaire)
  .put(protect, updateExperienceQuestionnaire);
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
router
  .route("/:id/cv")
  .get(getCvQuestionnaire)
module.exports = router;
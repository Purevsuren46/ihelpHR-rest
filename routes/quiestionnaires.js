const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  deleteFamilyQuestionnaire,
} = require("../controller/questionnaires");

// api/v1/questionnaires/:id/books
// const { getQuestionnaireJobs } = require("../controller/jobs");
// const { getQuestionnaireAnnouncements } = require("../controller/announcements");
// router.route("/:questionnaireId/Jobs").get(getQuestionnaireJobs);
// router.route("/:questionnaireId/Announcements").get(getQuestionnaireAnnouncements);

//"/api/v1/questionnaires"
router
  .route("/")
  .get(getQuestionnaires).post(protect, createQuestionnaire);

router
  .route("/:id")
  .get(getQuestionnaire)
  .put(protect, authorize("admin", "operator"), updateQuestionnaire)
  .delete(protect, deleteQuestionnaire);
router
  .route("/:id/family")
  .delete(protect, deleteFamilyQuestionnaire);


module.exports = router;
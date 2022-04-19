const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} = require("../controller/questionnaires");

// api/v1/questionnaires/:id/books
// const { getQuestionnaireJobs } = require("../controller/jobs");
// const { getQuestionnaireAnnouncements } = require("../controller/announcements");
// router.route("/:questionnaireId/Jobs").get(getQuestionnaireJobs);
// router.route("/:questionnaireId/Announcements").get(getQuestionnaireAnnouncements);

//"/api/v1/questionnaires"
router
  .route("/")
  .get(getQuestionnaires);

router
  .route("/:id")
  .get(getQuestionnaire)
  .put(protect, authorize("admin", "operator"), updateQuestionnaire)
  .delete(protect, deleteQuestionnaire);

router.route("/:id").post(protect, createQuestionnaire);

module.exports = router;
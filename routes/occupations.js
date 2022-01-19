const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getOccupations,
  getOccupation,
  createOccupation,
  updateOccupation,
  deleteOccupation,
} = require("../controller/occupations");

// api/v1/occupations/:id/books
const { getOccupationJobs } = require("../controller/jobs");
const { getOccupationAnnouncements } = require("../controller/announcements");
router.route("/:occupationId/Jobs").get(getOccupationJobs);
router.route("/:occupationId/Announcements").get(getOccupationAnnouncements);

//"/api/v1/occupations"
router
  .route("/")
  .get(getOccupations)
  .post(protect, createOccupation);

router
  .route("/:id")
  .get(getOccupation)
  .put(protect, authorize("admin", "operator"), updateOccupation)
  .delete(protect, authorize("admin"), deleteOccupation);

module.exports = router;
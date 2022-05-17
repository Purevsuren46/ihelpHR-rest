const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
} = require("../controller/schools");

// api/v1/schools/:id/books
// const { getSchoolJobs } = require("../controller/jobs");
// const { getSchoolAnnouncements } = require("../controller/announcements");
// router.route("/:schoolId/Jobs").get(getSchoolJobs);
// router.route("/:schoolId/Announcements").get(getSchoolAnnouncements);

//"/api/v1/schools"
router
  .route("/")
  .get(getSchools)
  .post(protect, createSchool);

router
  .route("/:id")
  .get(getSchool)
  .put(protect, authorize("admin", "operator"), updateSchool)
  .delete(protect, deleteSchool);


module.exports = router;
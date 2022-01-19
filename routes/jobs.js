const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getJobs,
  getJob,
  createJob,
  deleteJob,
  updateJob,
} = require("../controller/jobs");

const router = express.Router();

//"/api/v1/jobs"
router
  .route("/")
  .get(getJobs)
  .post(protect, createJob);

router
  .route("/:id")
  .get(getJob)
  .delete(protect, authorize("admin", "operator"), deleteJob)
  .put(protect, authorize("admin", "operator"), updateJob);

// router.route("/:id/upload-photo").put(uploadJobPhoto);

module.exports = router;
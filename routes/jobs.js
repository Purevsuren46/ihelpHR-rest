const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getJobs,
  getJob,
  createJob,
  deleteJob,
  updateJob,
  applyJob,
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

router.route("/:id/apply").get(protect, applyJob);

module.exports = router;
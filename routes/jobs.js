const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getJobs,
  getJob,
  createJob,
  getSpecialJobs,
  getUnspecialJobs,
  getUrgentJobs,
  getProfileJobs,
  getCvFilterJobs,
  specialJob,
  urgentJob,
  deleteJob,
  updateJob,
  evalCand,
} = require("../controller/jobs");

const router = express.Router();

//"/api/v1/jobs"
router
  .route("/")
  .get(protect, getJobs)
  .post(protect, createJob);

router.route("/specials").get(protect, getSpecialJobs)
router.route("/unspecials").get(protect, getUnspecialJobs)
router.route("/urgents").get(protect, getUrgentJobs)
router.route("/filters").get(protect, getCvFilterJobs)
  


router
  .route("/:id")
  .get(getJob)
  .delete(protect, deleteJob)
  .put(protect, updateJob);

router.route("/:id/eval").put(protect, evalCand);
router.route("/:id/special").put(protect, specialJob);
router.route("/:id/urgent").put(protect, urgentJob);
router.route("/profile").get(protect, getProfileJobs);

module.exports = router;
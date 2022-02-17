const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getJobs,
  getJob,
  createJob,
  getSpecialJobs,
  getCvFilterJobs,
  specialJob,
  urgentJob,
  likeJob,
  unlikeJob,
  deleteJob,
  updateJob,
  applyJob,
  evalCand,
} = require("../controller/jobs");

const router = express.Router();

//"/api/v1/jobs"
router
  .route("/")
  .get(protect, getJobs)
  .post(protect, createJob);

router.route("/specials").get(protect, getSpecialJobs)
router.route("/filters").get(protect, getCvFilterJobs)
  
router.route("/:id/like").get(protect, likeJob)  
router.route("/:id/unlike").get(protect, unlikeJob)  


router
  .route("/:id")
  .get(getJob)
  .delete(protect, authorize("admin", "operator"), deleteJob)
  .put(protect, authorize("admin", "operator"), updateJob);

router.route("/:id/apply").get(protect, applyJob);
router.route("/:id/eval").put(protect, evalCand);
router.route("/:id/special").put(protect, specialJob);
router.route("/:id/urgent").put(protect, urgentJob);

module.exports = router;
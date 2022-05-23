const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getApplies,
  getProfileApplies,
  getJobApplies,
  getApply,
  getCvApplies,
  createApply,
  createProfileApply,
  updateApply,
  deleteApply,
  deleteProfileApply,
} = require("../controller/applies");


//"/api/v1/applies"
router
  .route("/")
  .get(getApplies)

router
  .route("/:id/job")
  .get(getJobApplies)

router
  .route("/:id")
  .get(protect, getApply)
  .put(protect, authorize("admin", "operator"), updateApply)
  .delete(protect, deleteApply)
  .post(protect, createApply);

router
  .route("/:id/profile")
  .get(protect, getProfileApplies)
  .post(protect, createProfileApply)
  .delete(protect, deleteProfileApply);

router.route("/:cvId/apply").get(protect, getCvApplies)
module.exports = router;
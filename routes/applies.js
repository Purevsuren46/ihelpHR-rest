const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getApplies,
  getApply,
  getCvApplies,
  createApply,
  updateApply,
  deleteApply,
} = require("../controller/applies");


//"/api/v1/applies"
router
  .route("/")
  .get(getApplies)

router
  .route("/:id")
  .get(protect, getApply)
  .put(protect, authorize("admin", "operator"), updateApply)
  .delete(protect, authorize("admin"), deleteApply)
  .post(protect, createApply);

router.route("/:cvId/apply").get(protect, authorize("admin"), getCvApplies)
module.exports = router;
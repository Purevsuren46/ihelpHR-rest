const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getExperiences,
  getExperience,
  getCvExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require("../controller/experiences");


//"/api/v1/experiences"
router
  .route("/")
  .get(getExperiences)
  .post(protect, createExperience);

router
  .route("/:id")
  .get(getExperience)
  .put(protect, authorize("admin", "operator"), updateExperience)
  .delete(protect, authorize("admin"), deleteExperience);

router.route("/:cvId/experience").get(protect, authorize("admin"), getCvExperiences)
module.exports = router;
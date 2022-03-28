const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getScores,
  getScore,
  getCvScores,
  createScore,
  updateScore,
  deleteScore,
} = require("../controller/scores");


//"/api/v1/scores"
router
  .route("/")
  .get(getScores);

router
  .route("/:id")
  .get(getScore)
  .post(protect, createScore)
  .put(protect, updateScore)
  .delete(protect, deleteScore);

router.route("/:cvId/score").get(protect, authorize("admin"), getCvScores)
module.exports = router;
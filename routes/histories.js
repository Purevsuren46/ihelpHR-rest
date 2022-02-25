const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getHistories,
  getHistory,
  deleteHistory,
} = require("../controller/histories");


//"/api/v1/histories"
router
  .route("/")
  .get(getHistories)

router
  .route("/:id")
  .get(getHistory)
  .delete(protect, authorize("admin"), deleteHistory);

module.exports = router;
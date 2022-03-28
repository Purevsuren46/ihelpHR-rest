const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getShares,
  getShare,
  createShare,
  updateShare,
  deleteShare,
} = require("../controller/shares");

// api/v1/shares/:id/books
// const { getShareJobs } = require("../controller/jobs");
// const { getShareAnnouncements } = require("../controller/announcements");
// router.route("/:shareId/Jobs").get(getShareJobs);
// router.route("/:shareId/Announcements").get(getShareAnnouncements);

//"/api/v1/shares"
router
  .route("/")
  .get(getShares);

router
  .route("/:id")
  .get(getShare)
  .put(protect, authorize("admin", "operator"), updateShare)
  .delete(protect, deleteShare);

router.route("/:id").post(protect, createShare);

module.exports = router;
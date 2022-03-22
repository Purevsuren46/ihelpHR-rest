const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} = require("../controller/announcements");

const router = express.Router();

//"/api/v1/announcements"
router
  .route("/")
  .get(getAnnouncements)
  .post(protect, createAnnouncement);

router
  .route("/:id")
  .get(getAnnouncement)
  .delete(protect, deleteAnnouncement)
  .put(protect, updateAnnouncement);

// router.route("/:id/upload-photo").put(uploadAnnouncementPhoto);

module.exports = router;
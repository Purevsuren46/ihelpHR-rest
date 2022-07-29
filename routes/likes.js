const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getLikes,
  getPostLikes,
  getCvLikes,
  getCvPostLikes,
  getCvJobLikes,
  getJobLikes,
  getAnnouncementLikes,
  getCvAnnouncementLikes,
  getLike,
  createLike,
  createJobLike,
  createAnnouncementLike,
  updateLike,
  deleteLike,
  deleteJobLike,
  deleteId,
} = require("../controller/likes");

// api/v1/likes/:id/books
// const { getLikeJobs } = require("../controller/jobs");
// const { getLikeAnnouncements } = require("../controller/announcements");
// router.route("/:likeId/Jobs").get(getLikeJobs);
// router.route("/:likeId/Announcements").get(getLikeAnnouncements);

//"/api/v1/likes"
router
  .route("/")
  .get(getLikes);

router
  .route("/:id")
  .get(getLike)
  .put(protect, authorize("admin", "operator"), updateLike)
  .delete(protect, deleteLike);

router.route("/:id").post(protect, createLike);
router.route("/:id/job").post(protect, createJobLike);
router.route("/:id/announcement").post(protect, createAnnouncementLike);
router.route("/:id/post").get(protect, getPostLikes);
router.route("/:id/posts").get(protect, getCvPostLikes);
router.route("/:id/cv").get(protect, getCvLikes);
router.route("/:id/job").get(protect, getCvJobLikes);
router.route("/:id/jobs").get(protect, getJobLikes);
router.route("/:id/announcements").get(protect, getAnnouncementLikes);
router.route("/:id/announcement").get(protect, getCvAnnouncementLikes);
router.route("/:id/job").delete(protect, deleteJobLike);
router.route("/:id/id").delete(protect, deleteId);

module.exports = router;
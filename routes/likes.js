const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getLikes,
  getPostLikes,
  getCvLikes,
  getLike,
  createLike,
  updateLike,
  deleteLike,
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
router.route("/:id/post").get(protect, getPostLikes);
router.route("/:id/cv").get(protect, getCvLikes);

module.exports = router;
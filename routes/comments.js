const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getComments,
  getPostComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} = require("../controller/comments");

// api/v1/comments/:id/books
// const { getCommentJobs } = require("../controller/jobs");
// const { getCommentAnnouncements } = require("../controller/announcements");
// router.route("/:commentId/Jobs").get(getCommentJobs);
// router.route("/:commentId/Announcements").get(getCommentAnnouncements);

//"/api/v1/comments"
router
  .route("/")
  .get(getComments);

router
  .route("/:id")
  .get(getComment)
  .put(protect, authorize("admin", "operator"), updateComment)
  .delete(protect, authorize("admin"), deleteComment);

router.route("/:id").post(protect, createComment);
router.route("/:id/post").get(protect, getPostComments);

module.exports = router;
const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getPosts,
  getPost,
  createPost,
  deletePost,
  updatePost,
} = require("../controller/posts");

const router = express.Router();

//"/api/v1/posts"
router
  .route("/")
  .get(getPosts)
  .post(protect, createPost);

router
  .route("/:id")
  .get(getPost)
  .delete(protect, authorize("admin", "operator"), deletePost)
  .put(protect, authorize("admin", "operator"), updatePost);

// router.route("/:id/upload-photo").put(uploadPostPhoto);

module.exports = router;
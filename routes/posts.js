const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getPosts,
  getBoostPosts,
  getPost,
  createPost,
  boostPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
  uploadPostPhoto,
} = require("../controller/posts");

const router = express.Router();

//"/api/v1/posts"
router
  .route("/")
  .get(getPosts)
  .post(protect, createPost);
router.route("/boosts").get(getBoostPosts);


router.route("/:id/like").get(protect, likePost)  
router.route("/:id/unlike").get(protect, unlikePost)  
router.route("/:id/photo").put(protect, uploadPostPhoto)  
router
  .route("/:id")
  .get(getPost)
  .delete(protect, deletePost)
  .put(protect, authorize("admin", "operator"), updatePost);

router.route("/:id/boost").put(protect, boostPost);

module.exports = router;
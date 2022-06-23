const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getPosts,
  getPostsNoShare,
  getCvPosts,
  getUserPosts,
  getBoostPosts,
  getUnboostPosts,
  getFollowingPosts,
  getPost,
  createPost,
  boostPost,
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
router.route("/cv").get(protect, getCvPosts);
router.route("/:id/user").get(protect, getUserPosts);
router.route("/noshare").get(protect, getPostsNoShare);
router.route("/boosts").get(getBoostPosts);
router.route("/unboosts").get(getUnboostPosts);
router.route("/:id/following").get(protect, getFollowingPosts);


// router.route("/:id/like").get(protect, likePost)  
// router.route("/:id/unlike").get(protect, unlikePost)  
router.route("/:id/photo").put(protect, uploadPostPhoto)  
router
  .route("/:id")
  .get(protect, getPost)
  .delete(protect, deletePost)
  .put(protect, updatePost);

router.route("/:id/boost").put(protect, boostPost);


module.exports = router;
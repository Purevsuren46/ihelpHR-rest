const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  getCvs,
  getCv,
  getCvFollower,
  getCvFollowing,
  createCv,
  followCv,
  unfollowCv,
  updateCv,
  deleteCv,
  forgotPassword,
  resetPassword,
  logout,
  uploadCvCover,
  uploadCvProfile
} = require("../controller/cvs");

const {getCvPosts} = require("../controller/posts")

const router = express.Router();

//"/api/v1/cvs"
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);



//"/api/v1/cvs"
router
  .route("/")
  .get( getCvs)
  .post(createCv);
  
router.use(protect);
router.route("/:id/follow").get(followCv)  
router.route("/:id/unfollow").get(unfollowCv)  


router
  .route("/:id")
  .get(authorize("admin", "operator"), getCv)
  .put(authorize("admin"), updateCv)
  .delete(authorize("admin"), deleteCv);

router
  .route("/:id/posts")
  .get(authorize("admin", "operator", "user"), getCvPosts);

router.route("/:id/profile").put(uploadCvProfile);
router.route("/:id/cover").put(uploadCvCover);
router.route("/:id/follower").get(getCvFollower);
router.route("/:id/following").get(getCvFollowing);

module.exports = router;

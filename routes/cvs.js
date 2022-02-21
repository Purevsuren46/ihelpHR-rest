const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  getCvs,
  getCv,
  getCvFollower,
  getCvFollowing,
  getAuthCvs,
  createCv,
  settingProfile,
  cvList,
  urgentProfile,
  followCv,
  unfollowCv,
  updateCv,
  deleteCv,
  forgotPassword,
  resetPassword,
  chargePoint,
  logout,
  uploadCvCover,
  uploadCvProfile,
  uploadCvAuth
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
router.route("/profile").put(uploadCvProfile);
router.route("/cover").put(uploadCvCover);
router.route("/auth-photo").put(uploadCvAuth);
router.route("/point").put(chargePoint);

router.route("/setting/:id").put(settingProfile);
router.route("/urgent/:id").put(urgentProfile);
router.route("/cvlist/:id").put(cvList);

router.route("/:id/follow").get(followCv)  
router.route("/:id/unfollow").get(unfollowCv)  

router.route("/auths").get(getAuthCvs)
router
  .route("/:id")
  .get(authorize("admin", "operator"), getCv)
  .put( updateCv)
  .delete(authorize("admin"), deleteCv);

router
  .route("/:id/posts")
  .get(authorize("admin", "operator", "user"), getCvPosts);


router.route("/:id/follower").get(getCvFollower);
router.route("/:id/following").get(getCvFollowing);

module.exports = router;

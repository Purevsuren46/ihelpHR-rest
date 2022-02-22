const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  register,
  login,
  getProfiles,
  getProfile,
  followProfile,
  unfollowProfile,
  createProfile,
  chargePoint,
  chargeWallet,
  updateProfile,
  urgentProfile,
  specialProfile,
  cvList,
  deleteProfile,
  forgotPassword,
  resetPassword,
  logout,
  uploadCover,
  uploadProfile,
} = require("../controller/profiles");
const {
  getProfileJobs
} = require("../controller/jobs");

const {
  getProfileAnnouncements
} = require("../controller/announcements");


const router = express.Router();

//"/api/v1/profiles"
router.route("/register").post(register);

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
  .route("/")
  .get(getProfiles)
  .post(createProfile);


router.route("/profile/:id").put(uploadProfile);
router.route("/cover/:id").put(uploadCover);
router.use(protect);

router.route("/point").put(chargePoint);
router.route("/wallet").put(chargeWallet);
router.route("/special").put(specialProfile);
router.route("/urgent").put(urgentProfile);
router.route("/cvlist").put(cvList);
//"/api/v1/profiles"


router
  .route("/:id")
  .get(getProfile)
  .put( updateProfile)
  .delete(authorize("admin"), deleteProfile);

router.route("/:id/follow").get(followProfile)  
router.route("/:id/unfollow").get(unfollowProfile)  

router
  .route("/:id/jobs")
  .get( getProfileJobs);

router
  .route("/:id/announcements")
  .get( getProfileAnnouncements);


module.exports = router;

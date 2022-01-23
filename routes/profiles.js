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
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controller/profiles");
const {
  getProfileJobs
} = require("../controller/jobs");

const {
  getProfileAnnouncements
} = require("../controller/Announcements");


const router = express.Router();

//"/api/v1/profiles"
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.use(protect);


//"/api/v1/profiles"
router
  .route("/")
  .get(authorize("admin"), getProfiles)
  .post(authorize("admin"), createProfile);

router
  .route("/:id")
  .get(authorize("admin"), getProfile, )
  .put(authorize("admin"), updateProfile)
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

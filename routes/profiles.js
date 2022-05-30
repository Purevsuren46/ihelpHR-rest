const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  getProfiles,
  getProfile,
  getSpecialEmployeeProfiles,
  getUnspecialEmployeeProfiles,
  getSpecialEmployerProfiles,
  getUnspecialEmployerProfiles,
  createProfile,
  chargePoint,
  chargeWallet,
  invoiceWallet,
  updateProfile,
  specialEmployeeProfile,
  specialEmployerProfile,
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
// router.route("/invoice/:id").post(invoiceWallet);
// router.route("/callbacks/:id").get(chargeWallet);
//"/api/v1/profiles"
router.route("/register").post(createProfile);

router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/specials/employee").get(getSpecialEmployeeProfiles);
router.route("/unspecials/employee").get(getUnspecialEmployeeProfiles);
router.route("/specials/employer").get(getSpecialEmployerProfiles);
router.route("/unspecials/employer").get(getUnspecialEmployerProfiles);

router
  .route("/")
  .get(getProfiles)
  .post(createProfile);


router.route("/profile/:id").put(uploadProfile);
router.route("/cover/:id").put(uploadCover);
router
  .route("/:id/jobs")
  .get( getProfileJobs);

router.use(protect);

router.route("/point").put(chargePoint);

router.route("/special/employee").put(specialEmployeeProfile);
router.route("/special/employer").put(specialEmployerProfile);
//"/api/v1/profiles"


router
  .route("/:id")
  .get(protect, getProfile)
  .put( updateProfile)
  .delete(authorize("admin"), deleteProfile);


router
  .route("/:id/announcements")
  .get( getProfileAnnouncements);


module.exports = router;

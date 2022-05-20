const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  getCvs,
  getCv,
  getAuthCvs,
  createCv,
  settingProfile,
  sendPhone,
  authPhone,
  getCvActivity,
  cvList,
  urgentProfile,
  updateCv,
  deleteCv,
  deleteActivity,
  forgotPassword,
  resetPassword,
  chargePoint,
  logout,
  uploadCvCover,
  uploadCvProfile,
  uploadCvPortfolio,
  uploadCvAuth,
  invoiceWallet,
  invoiceSocialpay,
  chargeWallet,
  chargeSocial
} = require("../controller/cvs");

const {getCvPosts} = require("../controller/posts")

const router = express.Router();
router.route("/invoice/:id").post(invoiceWallet);
router.route("/social/:id").post(invoiceSocialpay);
router.route("/callbacks/:id/:numId").get(chargeWallet);
router.route("/callbacks").post(chargeSocial);
//"/api/v1/cvs"
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/send").post(sendPhone);


//"/api/v1/cvs"
router
  .route("/")
  .get( getCvs)
  .post(createCv);
  
router.use(protect);
router.route("/profile").put(uploadCvProfile);
router.route("/cover").put(uploadCvCover);
router.route("/portfolio").put(uploadCvPortfolio);
router.route("/auth-photo").put(uploadCvAuth);
router.route("/point").put(chargePoint);

router.route("/setting/:id").put(settingProfile);
router.route("/urgent/:id").put(urgentProfile);
router.route("/cvlist/:id").put(cvList);

router.route("/auths").get(getAuthCvs)
router.route("/activity").get(getCvActivity)
router
  .route("/:id")
  .get( getCv)
  .put( updateCv)
  .delete( deleteCv);

router
  .route("/:id/activity")
  .delete( deleteActivity);

router
  .route("/:id/posts")
  .get(getCvPosts);



module.exports = router;

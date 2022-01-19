const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  login,
  getCvs,
  getCv,
  createCv,
  updateCv,
  deleteCv,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controller/cvs");

const router = express.Router();

//"/api/v1/cvs"
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.use(protect);

//"/api/v1/cvs"
router
  .route("/")
  .get(authorize("admin"), getCvs)
  .post(authorize("admin"), createCv);

router
  .route("/:id")
  .get(authorize("admin", "operator"), getCv)
  .put(authorize("admin"), updateCv)
  .delete(authorize("admin"), deleteCv);

router
  .route("/:id/jobs")
//   .get(authorize("admin", "operator", "user"), getCvJobs);

module.exports = router;

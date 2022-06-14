const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  getSpecialAnnouncements,
  getUnspecialAnnouncements,
  getUrgentAnnouncements,
  getProfileAnnouncements,
  getCvFilterAnnouncements,
  specialAnnouncement,
  urgentAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  evalCand,
} = require("../controller/announcements");

const router = express.Router();

//"/api/v1/announcements"
router
  .route("/")
  .get(protect, getAnnouncements)
  .post(protect, createAnnouncement);

router.route("/specials").get(protect, getSpecialAnnouncements)
router.route("/unspecials").get(protect, getUnspecialAnnouncements)
router.route("/urgents").get(protect, getUrgentAnnouncements)
router.route("/filters").get(protect, getCvFilterAnnouncements)
  


router
  .route("/:id")
  .get(getAnnouncement)
  .delete(protect, deleteAnnouncement)
  .put(protect, updateAnnouncement);

router.route("/:id/eval").put(protect, evalCand);
router.route("/:id/special").put(protect, specialAnnouncement);
router.route("/:id/urgent").put(protect, urgentAnnouncement);
router.route("/profile").get(protect, getProfileAnnouncements);

module.exports = router;
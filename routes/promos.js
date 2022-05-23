const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getPromos,
  getPromo,
  createPromo,
  updatePromo,
  deletePromo,
} = require("../controller/promos");

// api/v1/promos/:id/books
// const { getPromoJobs } = require("../controller/jobs");
// const { getPromoAnnouncements } = require("../controller/announcements");
// router.route("/:promoId/Jobs").get(getPromoJobs);
// router.route("/:promoId/Announcements").get(getPromoAnnouncements);

//"/api/v1/promos"
router
  .route("/")
  .get(getPromos)
  .post(protect, createPromo);

router
  .route("/:id")
  .get(getPromo)
  .put(protect, updatePromo)
  .delete(protect, deletePromo);


module.exports = router;
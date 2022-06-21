const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getFollows,
  getFollowers,
  getCvFollows,
  getFollow,
  createFollow,
  updateFollow,
  deleteFollow,
  deleteFollowId,
} = require("../controller/follows");

// api/v1/follows/:id/books
// const { getFollowJobs } = require("../controller/jobs");
// const { getFollowAnnouncements } = require("../controller/announcements");
// router.route("/:followId/Jobs").get(getFollowJobs);
// router.route("/:followId/Announcements").get(getFollowAnnouncements);

//"/api/v1/follows"
router
  .route("/")
  .get(getFollows);

router
  .route("/:id")
  .get(getFollow)
  .put(protect, authorize("admin", "operator"), updateFollow)
  .delete(protect, deleteFollow);

router.route("/:id").post(protect, createFollow);
router.route("/:id/followers").get(protect, getFollowers);
router.route("/:id/cv").get(protect, getCvFollows);
router.route("/:id/id").delete(protect, deleteFollowId);

module.exports = router;
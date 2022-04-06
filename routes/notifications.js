const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getNotifications,
  getUserNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../controller/notifications");


//"/api/v1/notifications"
router
  .route("/")
  .get(getNotifications)
  .post(protect, createNotification);

router
  .route("/:id")
  .get(getNotification)
  .put(protect, authorize("admin", "operator"), updateNotification)
  .delete(protect, deleteNotification);

router.route("/:id/user").get(getUserNotifications)

module.exports = router;
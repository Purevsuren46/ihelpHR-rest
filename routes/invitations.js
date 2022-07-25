const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getInvitations,
  getCvInvitations,
  getCvSentInvitations,
  getInvitation,
  createInvitation,
  deleteInvitation,
} = require("../controller/invitations");


//"/api/v1/invitations"
router
  .route("/")
  .get(getInvitations)

router
  .route("/:id/cv")
  .get(getCvInvitations)

router
  .route("/:id/sent")
  .get(getCvSentInvitations)

router
  .route("/:id")
  .get(getInvitation)
  .post(protect, createInvitation)
  .delete(protect, deleteInvitation);

module.exports = router;
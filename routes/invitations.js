const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getInvitations,
  getInvitation,
  createInvitation,
  deleteInvitation,
} = require("../controller/invitations");


//"/api/v1/invitations"
router
  .route("/")
  .get(getInvitations)

router
  .route("/:id")
  .get(getInvitation)
  .post(protect, createInvitation)
  .delete(protect, deleteInvitation);

module.exports = router;
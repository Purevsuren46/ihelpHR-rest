const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getTransactions,
  getCvTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controller/transactions");



//"/api/v1/transactions"
router
  .route("/")
  .get(getTransactions)
  .post(protect, createTransaction);


router
  .route("/:id/cv")
  .get(getCvTransactions)
  .post(protect, createTransaction);

router
  .route("/:id")
  .get(getTransaction)
  .put(protect, authorize("admin", "operator"), updateTransaction)
  .delete(protect, authorize("admin"), deleteTransaction);

module.exports = router;

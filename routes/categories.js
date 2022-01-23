const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories");

const { getCategoryOccupations } = require("../controller/occupations");


router.route("/:categoryId/occupations").get(getCategoryOccupations);


//"/api/v1/categories"
router
  .route("/")
  .get(getCategories)
  .post(protect, createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin", "operator"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;

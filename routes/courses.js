const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCourses,
  getCourse,
  getCvCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/courses");


//"/api/v1/courses"
router
  .route("/")
  .get(getCourses)
  .post(protect, createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("admin", "operator"), updateCourse)
  .delete(protect, authorize("admin"), deleteCourse);

router.route("/:cvId/course").get(protect, authorize("admin"), getCvCourses)
module.exports = router;
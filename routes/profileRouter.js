const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const { uploadPhoto } = require("../config/multer-setup");
const { cloudinaryUpload } = require("../config/cloudinary-setup");
const authController = require("../controllers/AuthController");
router.get("/", isAuthenticated, (req, res) => {
  res.render("profile", { user: req.user });
});

router.post(
  "/image/update",
  isAuthenticated,
  uploadPhoto.single("profilePic"),
  cloudinaryUpload,
  authController.UpdateProfilePicture
);

router.post(
  "/email/update",
  isAuthenticated,
  authController.UpdateProfileEmail
);

module.exports = router;

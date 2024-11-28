const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/AuthController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/login", authController.GetLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/register", authController.GetRegister);
router.post("/register", authController.PostRegister);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  isAuthenticated,
  async (req, res, next) => {
    res.redirect("/profile");
  }
);

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:profile", "user:email"],
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/login" }),
  isAuthenticated,
  async (req, res, next) => {
    res.redirect("/profile");
  }
);

router.get("/logout", authController.GetLogout);

router.post("/delete", isAuthenticated, authController.DeleteUser);
module.exports = router;

const asyncHandler = require("express-async-handler");
const passport = require("passport");
const generatePw = require("../config/password-utils").generatePw;
require("dotenv").config();

const { body, param, validationResult } = require("express-validator");
const {
  createEmailUser,
  existingUserEmail,
  existingGoogleUser,
  deleteUser,
  existingGithubUser,
  deleteAllSessions,
  deleteAllUser,
  deleteUserId,
  updateUserPicture,
  updateUserEmail,
} = require("../db/userQueries");

exports.GetLogin = asyncHandler(async (req, res, next) => {
  try {
    res.render("login");
  } catch (e) {
    console.error(`Error Getting Login: ${e.message}`);
    res.status(404);
  }
});

exports.GetLogout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

exports.GetRegister = asyncHandler(async (req, res, next) => {
  try {
    await deleteAllUser();
    await deleteAllSessions();
    res.render("register");
  } catch (e) {
    console.error(`Error Getting Login: ${e.message}`);
    res.status(404);
  }
});

exports.PostRegister = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Passwords must be at least 6 characters long."),
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  body("cfmpassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("status".trim()),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    try {
      const { email, name, password } = req.body;
      // Check if email exists
      const existing = await existingUserEmail(email);
      if (existing) {
        throw Error({ message: "Existing email" });
      } else {
        //Alter password and status before sending in
        const hashedPassword = await generatePw(password);

        //Create a data object for sending into query
        const data = {
          email,
          name,
          password: hashedPassword,
        };

        const result = await createEmailUser(data);
        if (result) {
          res.status(201).json({
            success: true,
            message: `Account created.`,
          });
        }
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
      console.error(err);
    }
  }),
];

exports.UpdateProfilePicture = asyncHandler(async (req, res, next) => {
  try {
    const imageurl = req.cloudinaryResult.secure_url;
    const userId = req.user.id;
    const response = await updateUserPicture(userId, imageurl);
    if (response) {
      res.render("profile", { user: response });
    }
  } catch (err) {
    console.error("Database update error ", err);
    res.status(500).send("Failed to update user profile");
  }
});

exports.UpdateProfileEmail = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.user);
    console.log(req.body.email);

    const userId = req.user.id;
    const newEmail = req.body.email;
    if (newEmail) {
      const existing = await existingUserEmail(newEmail);
      if (existing) {
        throw new Error("Email exist in database");
      } else {
        const updateEmail = await updateUserEmail(userId, newEmail);
        if (updateEmail.email === newEmail) {
          res.status(200).send({ user: updateEmail });
        }
        console.log(updateEmail);
      }
    }

    //check if new user email is in db
    //update new user email if it does not exist in db
    //res.render("profile", userinfo)
  } catch (err) {
    console.error("Database update error ", err);
    res.status(500).send("Failed to update user email");
  }
});

exports.DeleteUser = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.googleId !== null) {
      //find the user data file
      const user = await existingGoogleUser(req.user.googleId);
      //revoke google account tokens
      if (user && user.googleAccessToken) {
        const response = await fetch(
          `https://oauth2.googleapis.com/revoke?token=${user.googleAccessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.ok) {
          //delete the user from the database
          const deleteUser = await deleteUserId(req.user.id);
          if (deleteUser) {
            res.redirect("/");
          } else {
            res.redirect("/profile");
          }
        } else {
          console.error(
            "Failed to revoke Google token: ",
            await response.text()
          );
        }
      } else {
        console.error("User or Google accesstoken not found");
      }
    } else if (req.user.githubId !== null) {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const user = await existingGithubUser(req.user.githubId);

      if (user && user.githubAccessToken) {
        const accessToken = user.githubAccessToken;

        try {
          const response = await fetch(
            `https://api.github.com/applications/${clientId}/token`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                access_token: accessToken,
              }),
            }
          );

          // Don't try to parse JSON for a 204 response
          if (response.status === 204) {
            // Delete user from database
            const deleteUser = await deleteUserId(req.user.id);
            if (deleteUser !== null) {
              // Clean up session before redirect
              await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                  if (err) reject(err);
                  res.clearCookie("connect.sid");
                  resolve();
                });
              });

              // Only redirect once, after everything is done
              return res.redirect("/");
            }
          } else {
            console.error(
              "Failed to revoke GitHub token, status:",
              response.status
            );
            return res.redirect("/profile");
          }
        } catch (error) {
          console.error("Error during GitHub token revocation:", error);
          return res.redirect("/profile");
        }
      } else {
        console.error("User or Github accesstoken not found");
        return res.redirect("/profile");
      }
    } else {
      // Handle regular user deletion
      const deleteUser = await deleteUserId(req.user.id);

      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            console.error("Failed to destroy session: ", err);
            reject(err);
          } else {
            res.clearCookie("connect.sid");
            resolve();
          }
        });
      });

      return res.redirect("/");
    }
  } catch (err) {
    console.error(`Error Deleting User: ${err.message}`);
    return res.status(500).redirect("/profile");
  }
});

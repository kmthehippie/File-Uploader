const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");

exports.GetHome = asyncHandler(async (req, res, next) => {
  try {
    res.render("home", { user: req.user || null });
  } catch (e) {
    console.error(`Error Getting Home: ${e.message}`);
    res.status(404);
  }
});

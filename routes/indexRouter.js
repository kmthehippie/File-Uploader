const express = require("express");
const router = express.Router();

const indexController = require("../controllers/IndexController");

router.get("/", indexController.GetHome);

module.exports = router;

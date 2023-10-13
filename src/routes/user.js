const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const checkForAuthenticationCookie = require("../middleware/authentication");

router.post("/createUser", UserController.createUser);
router.post(
  "/validateNumber",
  checkForAuthenticationCookie("token"),
  UserController.validateNumber
);
router.get(
  "/verify",
  checkForAuthenticationCookie("token"),
  UserController.renderVerify
);

module.exports = router;

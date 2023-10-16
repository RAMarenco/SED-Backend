const express = require("express");
const router = express.Router();
const jwtVerifyToken = require("../../middlewares/jwt");

const authController = require("../../controllers/auth.controller");

//* This route is the one that allows the login procedure to be executed
router.post("/login", authController.login);
//* This route verifies if the password sent is the same as the one in the database
//router.post("/verify", jwtVerifyToken, authController.verifyPassword);

module.exports = router;
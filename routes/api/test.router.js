const express = require("express");
const router = express.Router();
const jwtVerifyToken = require("../../middlewares/jwt");

const testController = require('../../controllers/test.controller');

//* Create answer Route and adds its reference to a question
router.post("/", jwtVerifyToken, testController.create);

//* Find all answers related to a question by question_id
//router.get("/:identifier", jwtVerifyToken, testController.findById);

module.exports = router;
const express = require("express");
const router = express.Router();
const jwtVerifyToken = require("../../middlewares/jwt");

const userController = require('../../controllers/user.controller');

//* Create answer Route and adds its reference to a question
router.post("/", userController.create);

//* Find all answers related to a question by question_id
router.get("/", jwtVerifyToken, userController.findAll);

router.delete("/", jwtVerifyToken, userController.delete);

module.exports = router;
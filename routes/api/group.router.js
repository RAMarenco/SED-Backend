const express = require("express");
const router = express.Router();
const jwtVerifyToken = require("../../middlewares/jwt");

const groupController = require('../../controllers/group.controller');

//* Create answer Route and adds its reference to a question
router.post("/", jwtVerifyToken, groupController.create);

router.delete("/", jwtVerifyToken, groupController.delete);

module.exports = router;
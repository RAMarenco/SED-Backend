var express = require('express');
var router = express.Router();

const authRouter = require("./auth.router");
const userRouter = require("./user.router");
const groupRouter = require("./group.router");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/group", groupRouter);

module.exports = router;

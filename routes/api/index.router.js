var express = require('express');
var router = express.Router();

const testRouter = require("./test.router");

router.use("/test", testRouter);

module.exports = router;
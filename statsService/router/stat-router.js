const express = require("express");
const router = express.Router();
const statController = require("../controller/stat-controller");

router.post("/", statController.addStat);
router.post("/report", statController.getStats);

module.exports = router;
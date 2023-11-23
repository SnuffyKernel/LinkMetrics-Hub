const express = require("express");
const router = express.Router();
const urlShortenerController = require('../controller/urlShortener-controller')

router.post("/", urlShortenerController.createShortenerUrl);
router.get("/:shortUrl", urlShortenerController.getOriginalUrl)

module.exports = router;
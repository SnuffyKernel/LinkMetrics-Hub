const genUrlShortener = require("../urlShortener/urlShortener")
const database = require("../database/database")
const statsService = require("../service/statsService")

class urlShortenerController {
  async createShortenerUrl(req, res) {
    const { originalUrl } = req.body
    if (!originalUrl) {
      return res
        .status(400)
        .json({ error: "Необходимо указать оригинальную ссылку" })
    }

    const shortUrl = genUrlShortener(8)
    try {
      await database.setShortUrl(shortUrl, originalUrl);
      res.json({ shortUrl: shortUrl })
    } catch (err) {
      console.error("Ошибка при создании сокращенной ссылки:", err);
      res.status(500).json({ error: "Ошибка при создании сокращенной ссылки" })
    }
  }

  async getOriginalUrl(req, res) {
    const { shortUrl } = req.params

    try {
      const originalUrl = await database.getShortUrl(shortUrl);
      if (!originalUrl) {
        return res.status(404).json({ error: "Сокращенная ссылка не найдена" });
      }
      statsService.sendStatsService(req)
      res.status(302).redirect(originalUrl)
    } catch (err) {
      res.status(500).json({ error: "Ошибка при поиске сокращенной ссылки" })
    }
  }
}

module.exports = new urlShortenerController();

const database = require("../database/database")
const report = require("../report/report")
const IPHelper = require("../utils/IPHelper")

class StatController {
  async addStat(req, res) { 
    try {
      const { ip, shortUrl, timestamp } = req.body;
      await database.addStat(ip, shortUrl, timestamp);
    } catch (err) {
      res.status(500).json({ error: "Ошибка при добавлении статистики" });
    }
  }

  async getStats(req, res) {
    try {
      const dimensions = req.body.dimensions
      const ip = IPHelper.getClientIP(req);   
      const stats = await database.getStatsByIP(ip);
      const statsReport = await report.createReport(ip, stats, dimensions);
      const filePath = report.createFileReport(statsReport)
      report.sendReport(res, filePath)       

    } catch (err) {
      res.status(500).json({ error: "Ошибка при получении статистики" });
    }
  }
}

module.exports = new StatController()
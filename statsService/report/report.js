const fs = require("fs");
const path = require("path");
const time = require("../utils/time")
const database = require("../database/database")

class Report {
  async createReport(ip, stats, dimensions) {
    try {
        if(!dimensions.includes("SourceIP") && !dimensions.includes("TimeInterval") && !dimensions.includes("URL")) {
            return []
        }
        
        let pidCounter = []
        let result = []
        let count = 0

        for (const [index, entry] of stats.entries()) {

            let date
            if (dimensions.includes("TimeInterval")) {
                date = time.formatData(entry)
                time.formatTimeInterval(entry)
            }
            else {
                entry.TimeInterval = undefined
                date = null
            }

            if (dimensions.includes("URL")) {
                const originalUrl = await database.getShortUrl(entry.URL)
                entry.URL = entry.URL === undefined ? "Unknown" : `${originalUrl} (${entry.URL})`
            } 
            else {
                entry.URL = undefined
            }

            let Pid
            if (entry.URL !== undefined) {
                if (!pidCounter[entry.URL]) {
                    pidCounter[entry.URL] = null;
                }

                Pid = pidCounter[entry.URL]++
            }

            if(dimensions.includes("SourceIP") && !( dimensions.includes("TimeInterval") || dimensions.includes("URL"))) {
                count += entry.Count
            }
            else {
                result.push({
                    Id: index + 1,
                    ...(dimensions.includes("URL") ? {Pid: Pid} : {}),
                    ...(dimensions.includes("SourceIP") ? {IP: ip} : {}),
                    ...(date !== null ? {Data: date} : {}),
                    ...entry,
                });
            }
        }

        if(dimensions.includes("SourceIP") && !( dimensions.includes("TimeInterval") || dimensions.includes("URL"))) {
            result.push({
                Id: 1,
                IP: ip,
                Count: count,
            })
        }

        return result;
    } catch(e) {
        console.error("Error in createReport: ", e)
        return [];
    }
  }

  createFileReport(stats) {
    try {
        const tempFilePath = path.join(__dirname, "tempReport.txt");
        fs.writeFileSync(tempFilePath, JSON.stringify(stats, null, 2), "utf-8");
        return tempFilePath;
    } catch(e) {
        console.error(e);
    }
  }

  sendReport(res, filePath) {
    try {
        res.download(filePath, "report.txt", (err) => {
        fs.unlinkSync(filePath);
        if (err) {
            res.status(500).json({ error: "Ошибка при скачивании файла" });
        }
        });
    } catch (e) {
        console.log(e)
    }
  }
}

module.exports = new Report();

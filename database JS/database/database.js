const fs = require("fs").promises;

class DataBase {
  constructor() {
    this.shortUrls = {};
    this.stats = {};
    this.dataFilePath = "database.json";
    this.initializeData();
  }

  async initializeData() {
    const fileExists = await fs
      .access(this.dataFilePath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      this.loadData();
    } else {
      console.log(`File ${this.dataFilePath} not found. Creating a new one.`);
      await this.saveData();
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataFilePath, "utf-8");
      const parsedData = JSON.parse(data);

      this.shortUrls = parsedData.shortUrls || {};
      this.stats = parsedData.stats || [];
    } catch (err) {
      console.error("Error loading data:", err.message);
    }
  }

  async saveData() {
    const dataToSave = JSON.stringify({
      shortUrls: this.shortUrls,
      stats: this.stats,
    });

    try {
      await fs.writeFile(this.dataFilePath, dataToSave, "utf-8");
    } catch (err) {
      console.error("Error saving data:", err.message);
    }
  }

  async setShortUrl(shortUrl, originalUrl) {
    this.shortUrls[shortUrl] = originalUrl;
    await this.saveData();
  }

  async getShortUrl(shortUrl) {
    return this.shortUrls[shortUrl];
  }

  async getAllShortUrl() {
    return this.shortUrls;
  }

  async addStat(ip, shortUrl, timesTamp) {
    if (!this.stats[ip]) {
      this.stats[ip] = [];
    }

    const currentTime = new Date(timesTamp).getTime();

    const existingEntry = stats[ip].find((entry) => {
      const entryTime = new Date(entry.TimeInterval).getTime();
      const timeDifference = Math.abs(currentTime - entryTime);
      const minutesDifference = timeDifference / this.TimeInterval;
      return entry.URL === shortUrl && minutesDifference < 1;
    });

    if (!existingEntry) {
      this.stats[ip].push({ TimeInterval: timesTamp, URL: shortUrl, Count: 1 });
    } else {
      existingEntry.Count += 1;
    }

    await this.saveData();
  }

  async getStatsByIP(ip) {
    return JSON.parse(JSON.stringify(this.stats[ip] || []));
  }
}

module.exports = new DataBase();

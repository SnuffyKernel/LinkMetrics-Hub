class Time {
  constructor() {
    this.TimeInterval = 60000;
  }

  time(entry) {
    const startTime = new Date(entry.TimeInterval);
    const endTime = new Date(startTime.getTime() + this.TimeInterval);
    return { startTime, endTime };
  }

  formatTimeInterval(entry) {
    const { startTime, endTime } = this.time(entry);
    entry.TimeInterval =
      entry.TimeInterval === undefined
        ? "Unknown"
        : `${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()} - ${endTime.getHours()}:${endTime.getMinutes()}:${endTime.getSeconds()}`;
  }

  formatData(entry) {
    const { startTime } = this.time(entry);
    return `${startTime.getDate()}.${ startTime.getMonth() + 1}.${startTime.getFullYear()}`;
  }

  checkTimeInterval(stats, ip, timesTamp, shortUrl) {
    const currentTime = new Date(timesTamp).getTime();

    const existingEntry = stats[ip].find((entry) => {
      const entryTime = new Date(entry.TimeInterval).getTime();
      const timeDifference = Math.abs(currentTime - entryTime);
      const minutesDifference = timeDifference / this.TimeInterval;
      return entry.URL === shortUrl && minutesDifference < 1;
    });

    return existingEntry;
  }
}

module.exports = new Time()
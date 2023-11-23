const net = require("net");

class DataBase {
  constructor() {
    this.PORT = 6789;
    this.HOST = "localhost";
  }

  sendRequest(request, onResponse) {
    const client = new net.Socket();

    client.connect(this.PORT, this.HOST, () => {
      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data);

      if (onResponse) {
        onResponse(response);
      }

      client.end();
    });

    client.on("end", () => {});
  }

  async setShortUrl(shortUrl, originalUrl) {
    const setRequest = {
      method: "SET",
      params: {
        shortUrl: shortUrl,
        originalUrl: originalUrl,
      },
    };
    await this.sendRequest(setRequest);
  }

  async getShortUrl(shortUrl) {
    return new Promise((resolve, reject) => {
      const getRequest = {
        method: "GET",
        params: {
          shortUrl: shortUrl,
        },
      };

      const onResponse = (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      };

      this.sendRequest(getRequest, onResponse);
    });
  }

}

module.exports = new DataBase();

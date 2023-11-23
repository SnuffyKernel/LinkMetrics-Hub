const DataBase = require("./database/database")
const net = require("net")

const PORT = 6789

async function handleRequest(socket, request) {
      let response;
      switch (request.method) {
        case "SET":
          await DataBase.setShortUrl(request.params.shortUrl, request.params.originalUrl);
          response = { success: true };
          break;
        case "GET":
          const shortUrl = await DataBase.getShortUrl(request.params.shortUrl);
          response = shortUrl ;
          break;
        case "GET_ALL":
          const allShortUrls = await DataBase.getAllShortUrl();
          response = allShortUrls;
          break;
        case "ADD_STATS":
          await DataBase.addStat(request.params.ip, request.params.shortUrl, request.params.timesTamp);
          console.log(request.params.timesTamp);
          response = { success: true };
          break;
        case "GET_STATS":
          const statsByIP = await DataBase.getStatsByIP(request.params.ip);
          response = statsByIP ;
          break;
        default:
          response = { success: false, error: "Invalid method" };
      }

      socket.write(JSON.stringify(response));
}

function startServer() {
    const server = net.createServer((socket) => {
      socket.on("data", (data) => {
        const request = JSON.parse(data);
        handleRequest(socket, request);
      });
      socket.on("end", () => {});
    });

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    });
}

startServer()
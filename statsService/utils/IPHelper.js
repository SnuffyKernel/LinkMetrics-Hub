class IPHelper {
  getClientIP(req) {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.connection.remoteAddress;
  }
}

module.exports = new IPHelper();
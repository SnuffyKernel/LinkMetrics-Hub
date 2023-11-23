const axios = require("axios")
const IPHelper = require('../utils/IPHelper')

class StatsService {
    sendStatsService(req) {
        try{
            const timestamp = new Date().toISOString();
            const shortUrl = req.params.shortUrl;
            const ip = IPHelper.getClientIP(req);   
            axios.post('http://localhost:4000/', {ip, shortUrl, timestamp}).catch(e => {console.error(e)})
        } catch(e) {
            console.log(e)
        }
    }
}

module.exports = new StatsService()
const axios = require("axios")
const IPHelper = require('../utils/IPHelper')

const urlStatsService = 'http://stats_service:4000/' //for docker

class StatsService {
    sendStatsService(req) {
        try{
            const timestamp = new Date().toISOString();
            const shortUrl = req.params.shortUrl;
            const ip = IPHelper.getClientIP(req);   
            axios.post(urlStatsService, {ip, shortUrl, timestamp}).catch(e => {console.error(e)})
        } catch(e) {
            console.log(e)
        }
    }
}

module.exports = new StatsService()

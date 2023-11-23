const express = require('express')
const cors = require('cors')
const urlShortenerRouter = require('./router/urlShortener-router')
const port = 3000

const app = express()

app.use(cors())
app.use(express.json())
app.use("/", urlShortenerRouter)

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`)
});
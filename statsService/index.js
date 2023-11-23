const express = require('express')
const cors = require('cors')
const statRouter = require('./router/stat-router')
const port = 4000

const app = express()

app.use(cors())
app.use(express.json())
app.use("/", statRouter)

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`)
});
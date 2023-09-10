const express = require('express')

const router = require('./route')
const { PORT } = require('../configs/constants')

const app = express()

router(app)

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})

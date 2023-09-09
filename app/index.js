const PORT = 3000

const express = require('express')

const router = require('./route')

const app = express()

router(app)

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})

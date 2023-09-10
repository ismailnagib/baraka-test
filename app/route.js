const stockService = require('./services/stock')
const bucketService = require('./services/bucket')

const { HTTP_STATUS_CODE } = require('../configs/constants')

const errorHandler = (error, res) => {
  const statusCode = error.statusCode || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR

  return res.status(statusCode).json({ message: error.message })
}

const router = (app) => {
  app.get('/portfolio/stocks', (req, res) => {
    const { symbol } = req.query

    return stockService.getPortfolioBySymbol(symbol)
      .then(result => res.status(HTTP_STATUS_CODE.OK).json(result))
      .catch(error => errorHandler(error, res))
  })

  app.get('/portfolio/buckets', (req, res) => {
    const { name } = req.query

    return bucketService.getPortfolioByBucketName(name)
      .then(result => res.status(HTTP_STATUS_CODE.OK).json(result))
      .catch(error => errorHandler(error, res))
  })
}

module.exports = router

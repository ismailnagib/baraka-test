const stock = require('./stock')
const buckets = require('../configs/buckets')

const {
  HTTP_STATUS_CODE
} = require('../configs/constants')

/**
 * Get stock portfolio by bucket name
 *
 * @param {?string} bucketName
 *
 * @returns {Object}
 */
const getPortfolioByBucketName = async (bucketName) => {
  const bucketCode = bucketName ? bucketName.replace(/\s/g, '').toUpperCase() : null
  const bucket = bucketCode
    ? buckets.find(item => item.code === bucketCode)
    : null

  if (!bucket) {
    const error = new Error('Invalid bucket name')

    error.statusCode = HTTP_STATUS_CODE.BAD_REQUEST

    throw error
  }

  const {
    name,
    product_symbols: symbols
  } = bucket

  const portfolio = await Promise.all(
    symbols.map(symbol => stock.getPortfolioBySymbol(symbol).catch(error => {
      console.error(error)

      return { symbol, error: error.message }
    }))
  )

  let totalShareQuantity = 0
  let totalLatestPrice = 0
  let totalInvested = 0
  let totalCurrentValue = 0
  let realizedProfitLoss = 0
  let unrealizedProfitLoss = 0

  const productProfitLosses = []

  portfolio.forEach(product => {
    const {
      symbol,
      error,
      total_share_quantity: productShareQuantity,
      latest_price: productLatestPrice,
      invested_amount: productInvestedAmount,
      current_value: productCurrentValue,
      realized_profit_loss: productRealizedProfitLoss,
      unrealized_profit_loss: productUnrealizedProfitLoss
    } = product

    if (error) {
      productProfitLosses.push({ symbol, error })

      return
    }

    totalShareQuantity += productShareQuantity
    totalLatestPrice += productLatestPrice
    totalInvested += productInvestedAmount
    totalCurrentValue += productCurrentValue
    realizedProfitLoss += productRealizedProfitLoss
    unrealizedProfitLoss += productUnrealizedProfitLoss

    productProfitLosses.push({
      symbol,
      realized_profit_loss: productRealizedProfitLoss,
      unrealized_profit_loss: productUnrealizedProfitLoss
    })
  })

  const averageBuyPrice = totalShareQuantity > 0 ? (totalInvested / totalShareQuantity) : 0

  return {
    name,
    total_share_quantity: totalShareQuantity,
    average_buy_price: averageBuyPrice,
    latest_price: totalLatestPrice,
    invested_amount: totalInvested,
    current_value: totalCurrentValue,
    realized_profit_loss: realizedProfitLoss,
    unrealized_profit_loss: unrealizedProfitLoss,
    product: productProfitLosses
  }
}

module.exports = {
  getPortfolioByBucketName
}

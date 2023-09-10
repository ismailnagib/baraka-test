const stockService = require('./stock')
const buckets = require('../../configs/buckets')

const {
  HTTP_STATUS_CODE,
  ROUNDING_DECIMAL_DIGIT
} = require('../../configs/constants')

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
    symbols.map(symbol => stockService.getPortfolioBySymbol(symbol).catch(error => {
      console.error(error)

      return { symbol, error: error.message }
    }))
  )

  let totalShareQuantity = 0
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
  const latestPrice = totalShareQuantity > 0 ? (totalCurrentValue / totalShareQuantity) : 0

  return {
    name,
    total_share_quantity: totalShareQuantity,
    average_buy_price: parseFloat(averageBuyPrice.toFixed(ROUNDING_DECIMAL_DIGIT)),
    latest_price: parseFloat(latestPrice.toFixed(ROUNDING_DECIMAL_DIGIT)),
    invested_amount: parseFloat(totalInvested.toFixed(ROUNDING_DECIMAL_DIGIT)),
    current_value: parseFloat(totalCurrentValue.toFixed(ROUNDING_DECIMAL_DIGIT)),
    realized_profit_loss: parseFloat(realizedProfitLoss.toFixed(ROUNDING_DECIMAL_DIGIT)),
    unrealized_profit_loss: parseFloat(unrealizedProfitLoss.toFixed(ROUNDING_DECIMAL_DIGIT)),
    profit_losses: productProfitLosses
  }
}

module.exports = {
  getPortfolioByBucketName
}

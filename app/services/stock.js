const moment = require('moment')
const axios = require('axios')
const fs = require('node:fs/promises')
const path = require('node:path')

const allTrades = require('../../trades.json')

const {
  VALID_PRODUCT_SYMBOLS,
  HTTP_STATUS_CODE,
  TRADE_TYPE,
  BARAKA_API_HOST,
  ROUNDING_DECIMAL_DIGIT,
  HISTORICAL_PRICE_DIRECTORY,
  HISTORICAL_PRICE_FILE_NAME_PREFIX
} = require('../../configs/constants')

/**
 * Get stock portfolio by symbol
 *
 * @param {?string} symbol
 *
 * @returns {Promise<Object>}
 */
const getPortfolioBySymbol = async (symbol) => {
  symbol = symbol?.trim()?.toUpperCase()

  if (!symbol || !VALID_PRODUCT_SYMBOLS.includes(symbol)) {
    const error = new Error('Invalid symbol')

    error.statusCode = HTTP_STATUS_CODE.BAD_REQUEST

    throw error
  }

  const trades = sortByDate(
    allTrades.filter(trade => trade.symbol.trim().toUpperCase() === symbol && moment(trade.date).isValid())
  )

  const historicalPriceData = await getHistoricalPriceBySymbol(symbol)

  const latestPrice = historicalPriceData.at(-1).close
  const latestPriceDate = moment(historicalPriceData.at(-1).date).format('YYYY-MM-DD')

  if (trades.length < 1) {
    return {
      symbol,
      total_share_quantity: 0,
      average_buy_price: 0,
      latest_price: latestPrice,
      invested_amount: 0,
      current_value: 0,
      realized_profit_loss: 0,
      unrealized_profit_loss: 0,
      latest_price_date: latestPriceDate,
      trades: []
    }
  }

  const historicalPriceByDate = {}

  historicalPriceData.forEach(value => {
    const key = moment(value.date).format('YYYY_MM_DD')

    historicalPriceByDate[key] = value
  })

  let totalShareQuantity = 0
  let totalInvested = 0
  let realizedProfitLoss = 0

  const validTrades = []

  trades.forEach(trade => {
    const {
      type,
      share_quantity: shareQuantity,
      date
    } = trade

    const price = historicalPriceByDate[moment(date).format('YYYY_MM_DD')]?.close

    if (!Number.isFinite(price)) {
      return
    }

    const result = {
      ...trade,
      price,
      total_amount: parseFloat((price * shareQuantity).toFixed(ROUNDING_DECIMAL_DIGIT))
    }

    switch (type?.toLowerCase()) {
      case TRADE_TYPE.BUY: {
        totalShareQuantity += shareQuantity
        totalInvested += shareQuantity * price

        break
      }
      case TRADE_TYPE.SELL: {
        if (totalShareQuantity < shareQuantity) {
          const error = new Error(`Invalid trade, attempting to sell more shares than what is owned on ${moment(date).format('YYYY-MM-DD')}`)

          error.statusCode = HTTP_STATUS_CODE.BAD_REQUEST

          throw error
        }

        const averageBuyPrice = totalInvested / totalShareQuantity
        const profitLoss = (price - averageBuyPrice) * shareQuantity

        totalShareQuantity -= shareQuantity
        totalInvested = averageBuyPrice * totalShareQuantity
        realizedProfitLoss += profitLoss

        result.average_buy_price = parseFloat(averageBuyPrice.toFixed(ROUNDING_DECIMAL_DIGIT))
        result.total_buy_amount = parseFloat((averageBuyPrice * shareQuantity).toFixed(ROUNDING_DECIMAL_DIGIT))
        result.realized_profit_loss = parseFloat(profitLoss.toFixed(ROUNDING_DECIMAL_DIGIT))

        break
      }
      default: {
        return
      }
    }

    delete result.symbol

    validTrades.push(result)
  })

  const totalCurrentValue = totalShareQuantity * latestPrice
  const averageBuyPrice = totalShareQuantity > 0 ? (totalInvested / totalShareQuantity) : 0

  return {
    symbol,
    total_share_quantity: totalShareQuantity,
    average_buy_price: parseFloat(averageBuyPrice.toFixed(ROUNDING_DECIMAL_DIGIT)),
    latest_price: latestPrice,
    invested_amount: parseFloat(totalInvested.toFixed(ROUNDING_DECIMAL_DIGIT)),
    current_value: parseFloat(totalCurrentValue.toFixed(ROUNDING_DECIMAL_DIGIT)),
    realized_profit_loss: parseFloat(realizedProfitLoss.toFixed(ROUNDING_DECIMAL_DIGIT)),
    unrealized_profit_loss: parseFloat((totalCurrentValue - totalInvested).toFixed(ROUNDING_DECIMAL_DIGIT)),
    latest_price_date: latestPriceDate,
    trades: validTrades
  }
}

/**
 * Get historical price by symbol
 *
 * @param {string} symbol
 *
 * @returns {Promise<Object[]>}
 */
const getHistoricalPriceBySymbol = async (symbol) => {
  symbol = symbol.toUpperCase()

  const url = `${BARAKA_API_HOST}/v1/finance_market/quotes/${symbol}/historical?range=month&interval=day`

  const { data: { data: historicalPrice = [] } } = await axios.get(url).catch(error => {
    console.error(`Request to ${url} failed, error:`, error.message)

    return { data: {} }
  })

  const historicalPriceFileName = `${HISTORICAL_PRICE_FILE_NAME_PREFIX}-${symbol}.json`
  const historicalPriceFilePath = path.join(__dirname, '../..', HISTORICAL_PRICE_DIRECTORY, historicalPriceFileName)

  let savedHistoricalPrice = []

  try {
    savedHistoricalPrice = require(historicalPriceFilePath)
  } catch (error) {
    // This is to handle if the file does not exist

    console.error(error.message)

    savedHistoricalPrice = []
  }

  const historicalPriceByDate = {}

  savedHistoricalPrice.forEach(value => {
    const key = moment(value.date).format('YYYY_MM_DD')

    historicalPriceByDate[key] = value
  })

  // This is to replace values with latest data if available
  historicalPrice.forEach(value => {
    const key = moment(value.date).format('YYYY_MM_DD')

    historicalPriceByDate[key] = value
  })

  const result = sortByDate(Object.values(historicalPriceByDate))

  if (result.length < 1) {
    const error = new Error(`Failed to get historical price data for ${symbol}`)

    error.statusCode = HTTP_STATUS_CODE.NOT_FOUND

    throw error
  }

  await fs.writeFile(historicalPriceFilePath, JSON.stringify(result, null, 2))

  return result
}

/**
 * Sort an array of object by their `date` field
 *
 * @param {Object[]} data
 * @param {string} data.date
 *
 * @returns {Object[]}
 */
const sortByDate = (data) => {
  return data.sort((a, b) => {
    const aDate = moment(a.date)
    const bDate = moment(b.date)

    if (aDate.isSame(bDate)) {
      return 0
    }

    return aDate.isBefore(bDate) ? -1 : 1
  })
}

module.exports = { getPortfolioBySymbol }

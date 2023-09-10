module.exports = Object.freeze({
  PORT: 3000,
  VALID_PRODUCT_SYMBOLS: [
    'PBR',
    'AAPL',
    'NVDA',
    'NIO',
    'AMD',
    'F',
    'TSLA',
    'AMZN',
    'AMC',
    'CCL'
  ],
  HTTP_STATUS_CODE: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  TRADE_TYPE: {
    BUY: 'buy',
    SELL: 'sell'
  },
  BARAKA_API_HOST: 'https://api.dev.app.getbaraka.com',
  ROUNDING_DECIMAL_DIGIT: 4,
  HISTORICAL_PRICE_DIRECTORY: 'historical-price',
  HISTORICAL_PRICE_FILE_NAME_PREFIX: 'historical-price'
})

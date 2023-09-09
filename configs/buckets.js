let buckets = [
  {
    name: 'Bucket A',
    product_symbols: [
      'PBR',
      'AAPL',
      'NVDA',
      'NIO',
      'AMD'
    ]
  },
  {
    name: 'Bucket B',
    product_symbols: [
      'F',
      'TSLA',
      'AMZN',
      'AMC',
      'CCL'
    ]
  }
]

buckets = buckets.map(bucket => ({
  ...bucket,
  code: bucket.name.replace(/\s/g, '').toUpperCase()
}))

module.exports = Object.freeze(buckets)

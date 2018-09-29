const Decimal = require('decimal.js')

const sub = (...args) => Number(Decimal.sub(...args))
const mul = (...args) => Number(Decimal.mul(...args))
const div = (...args) => Number(Decimal.div(...args))

module.exports = {
  sub,
  mul,
  div
}

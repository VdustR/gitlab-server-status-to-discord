
const timestring = require('timestring')

const parseTime = str => {
  return timestring(str) * 1000
}

module.exports = parseTime

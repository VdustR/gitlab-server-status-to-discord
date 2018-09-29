const df = require('node-df')

const asyncDf = () => new Promise((resolve, reject) => {
  df((error, response) => {
    if (error) {
      reject(error)
      return
    }

    resolve(response)
  })
})

module.exports = asyncDf

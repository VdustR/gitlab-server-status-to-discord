const axios = require('axios')

const Message = require('./Message')
const config = require('../config')

const { webhook } = config.discord

const sent = content => axios.post(webhook, {
  content
}, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

module.exports = {
  Message,
  sent
}

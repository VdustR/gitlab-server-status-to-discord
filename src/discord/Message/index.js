const config = require('../../config')
const { warningUsers } = config.discord
class Message {
  static escapeCode (str) {
    return str.replace(/```/g, ' ` ` ` ')
  }

  static strongMarkdown (str) {
    return `__${str}__`
  }

  constructor (message = '') {
    this.message = message
  }

  toJSON () {
    return this.message
  }

  addUser (str = '') {
    if (!str) {
      return this
    }

    this.addBreakIfAppend()
    this.message += `@${str}`
    return this
  }

  addWarningUsers () {
    this.addBreakIfAppend()
    this.message += warningUsers.map(name => `@${name}`).join(' ')
    return this
  }

  addText (str = '') {
    if (!str) {
      return this
    }

    this.addBreakIfAppend()
    this.message += str
    return this
  }

  addCode (str = '', type = 'text') {
    if (!str) {
      return this
    }

    this.addBreakIfAppend()
    this.message += `\`\`\`${type}`
    this.addBr()
    this.message += Message.escapeCode(str)
    this.addBr()
    this.message += '```'
    return this
  }

  addBr (count = 1) {
    while (count-- > 0) {
      this.message += Message.lineBreak
    }
    return this
  }

  addBreakIfAppend () {
    if (this.message.trim().length > 0) {
      this.addBr()
    }
    return this
  }
}

Message.lineBreak = '\n'
Message.gt = '﹥'
Message.lt = '﹤'

module.exports = Message

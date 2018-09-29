const util = require('util')
require('./config') // load config first

const discord = require('./discord')
const df = require('./df')
const gitlabBackupChecker = require('./gitlabBackupChecker')

const inspect = util.inspect
const Message = discord.Message

const err = (e) => {
  const errMsg = inspect(e, { showHidden: true, showProxy: true, compact: false })
  const msg = new Message()
  msg.addWarningUsers()
  msg
    .addText('Error occurred:')
    .addCode(errMsg)
  discord.sent(msg)
  console.error(errMsg)
}

const end = () => {
  const msg = new Message('All checker completed!')
  discord.sent(msg)
}

const start = async () => {
  console.log('App starting...')
  try {
    await Promise.all([
      df.run(),
      gitlabBackupChecker.run()
    ])
  } catch (e) {
    err(e)
  }
  await new Promise(resolve => setTimeout(resolve, 1000))
  end()
}

start().catch(e => console.error(e))

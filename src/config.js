// const { inspect } = require('util')
const dotenv = require('dotenv')
const filesizeParser = require('filesize-parser')
const isRegexpString = require('is-regexp-string')
const regexParser = require('regex-parser')
const parseTime = require('./utils/parseTime')
const { div } = require('./utils/math')

console.log('Loading configuration...')

const result = dotenv.config()

if (result.error) {
  throw result.error
}

const {
  DISCORD_WEBHOOK,
  DISCORD_WARNING_USERS,
  GITLAB_BACKUP_DIRECTORY,
  GITLAB_BACKUP_DURATION,
  DF_MIN_SIZE_TO_CHECK,
  DF_MIN_CAPACITY_TO_WARN,
  DF_MAX_AVAILABLE_TO_WARN,
  DF_IGNORE_MOUNT
} = process.env

const config = {
  discord: {
    webhook: DISCORD_WEBHOOK,
    warningUsers: DISCORD_WARNING_USERS.split(',')
  },
  gitlabBackupChecker: {
    directory: GITLAB_BACKUP_DIRECTORY,
    duration: parseTime(GITLAB_BACKUP_DURATION)
  },
  df: {
    minSizeToCheck: div(filesizeParser(DF_MIN_SIZE_TO_CHECK), 1024),
    minCapacityToWarn: Number.parseFloat(DF_MIN_CAPACITY_TO_WARN),
    maxAvailableToWarn: div(filesizeParser(DF_MAX_AVAILABLE_TO_WARN), 1024),
    ignoreMount: DF_IGNORE_MOUNT.split(',').map(opt => (
      isRegexpString(opt) ? regexParser(opt) : opt
    ))
  }
}

console.log('configurated loaded!')

// console.log(
//   'configuration: ',
//   inspect(config, { compact: false })
// )

module.exports = config

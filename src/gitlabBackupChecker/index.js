const util = require('util')
const fs = require('fs')
const path = require('path')

const filesize = require('filesize')
const formatDate = require('date-fns/format')
const prettyMs = require('pretty-ms')

const discord = require('../discord')
const config = require('../config')

const promisify = util.promisify
const readdir = fs.readdir
const stat = fs.stat
const asyncReaddir = promisify(readdir)
const asyncStat = promisify(stat)
const {
  directory,
  duration
} = config.gitlabBackupChecker
const Message = discord.Message
const {
  strongMarkdown,
  gt,
  lineBreak
} = Message

const latestModifiedTimeKey = 'mtime'

const getFiles = async (names, directory) => {
  const files = names.map(name => ({
    name,
    path: path.join(directory, name),
    stats: null
  }))
  await Promise.all(files.map(async file => {
    file.stats = await asyncStat(file.path)
  }))
  return files
}

const run = async () => {
  const durationStr = prettyMs(duration)
  const now = new Date()
  const fileNames = await asyncReaddir(directory)
  const files = await getFiles(fileNames, directory)
  const sortedFiles = files.sort((a, b) => b.stats[latestModifiedTimeKey] - a.stats[latestModifiedTimeKey])
  const msg = new Message()

  if (sortedFiles.length === 0) {
    msg
      .addWarningUsers()
      .addText(`Backup not found in ${directory}`)
    discord.sent(msg)
    return
  }

  const latestModifiedTime = sortedFiles[0].stats[latestModifiedTimeKey]
  const latestModifiedTimeDiff = now - latestModifiedTime
  const existsBackupInDuration = latestModifiedTimeDiff <= duration
  if (!existsBackupInDuration) {
    const latestModifiedTimeStr = prettyMs(latestModifiedTimeDiff)
    msg
      .addWarningUsers()
      .addText(`No backup in ${durationStr}, latest was ${strongMarkdown(latestModifiedTimeStr)} ago`)
  }

  const isLatestSmaller = sortedFiles.length >= 2 &&
    sortedFiles[0].stats.size < sortedFiles[1].stats.size
  if (isLatestSmaller) {
    if (existsBackupInDuration) {
      msg.addWarningUsers()
    }
    msg.addText('Latest backup is smaller')
  }

  if (existsBackupInDuration && !isLatestSmaller) {
    msg.addText('Backup works great!')
  }

  msg
    .addCode(
      `## Directory: ${directory}` + lineBreak +
      sortedFiles.map((file, index) => {
        const name = file.name
        const size = file.stats.size
        const sizeStr = filesize(size)
        const time = file.stats[latestModifiedTimeKey]
        const formatedDate = formatDate(time, 'yyyy-MM-dd HH:mm:ss.SSS')
        const timeDiff = now - time
        const timeDiffStr = prettyMs(timeDiff)
        return lineBreak + `### ${name}` + lineBreak +
          (
            isLatestSmaller && index <= 1
              ? `- size: ${strongMarkdown(sizeStr)}`
              : `- size: ${sizeStr}`
          ) + lineBreak +
          (
            !existsBackupInDuration && index === 0
              ? `- time: ${formatedDate} (${strongMarkdown(timeDiffStr)} ${gt} ${durationStr})`
              : `- time: ${formatedDate} (${timeDiffStr})`
          )
      }).join(lineBreak),
      'markdown'
    )

  discord.sent(msg)
}

module.exports = {
  run
}

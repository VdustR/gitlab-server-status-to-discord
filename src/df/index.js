const util = require('util')

const filesize = require('filesize')

const asyncDf = require('./asyncDf')
const discord = require('../discord')
const config = require('../config')
const {
  sub,
  mul
} = require('../utils/math')

const inspect = util.inspect
const {
  minSizeToCheck,
  minCapacityToWarn,
  maxAvailableToWarn,
  ignoreMount
} = config.df
const Message = discord.Message
const {
  strongMarkdown,
  lt,
  gt,
  lineBreak
} = Message

const diskToInfoString = disk => {
  const minCapacity = mul(minCapacityToWarn, 100)
  const minCapacityStr = `${minCapacity}%`
  const reachedMinCapacity = disk.capacity > minCapacityToWarn
  const maxAvailable = mul(maxAvailableToWarn, 1024)
  const maxAvailableStr = filesize(maxAvailable)
  const reachedMaxAvailable = disk.available < maxAvailableToWarn

  const {
    filesystem,
    mount
  } = disk
  const used = mul(disk.used, 1024)
  const usedStr = filesize(used)
  const size = mul(disk.size, 1024)
  const sizeStr = filesize(size)
  const available = mul(disk.available, 1024)
  const availableStr = filesize(available)

  const usedRate = mul(disk.capacity, 100)
  const usedRateStr = `${usedRate}%`
  const availableRate = sub(100, usedRate)
  const availableRateStr = `${availableRate}%`

  return `## ${filesystem}` + lineBreak +
    `- mount: ${mount}` + lineBreak +
    (
      reachedMinCapacity
        ? `- used: ${usedStr} / ${sizeStr} (${strongMarkdown(usedRateStr)} ${gt} ${strongMarkdown(minCapacityStr)})`
        : `- used: ${usedStr} / ${sizeStr} (${usedRateStr})`
    ) + lineBreak +
    (
      reachedMaxAvailable
        ? `- remain: ${strongMarkdown(availableStr)} / ${sizeStr} (${availableRateStr}) ${lt} ${strongMarkdown(maxAvailableStr)}`
        : `- remain: ${availableStr} / ${sizeStr} (${availableRateStr})`
    )
}

const disksToInfoString = disks => disks.map(diskToInfoString).join(lineBreak + lineBreak)

const success = (disksToCheck) => {
  const msg = new Message()
  msg
    .addText('Available spaces are enough to use:')
    .addCode(disksToInfoString(disksToCheck), 'markdown')
  discord.sent(msg)
}

const warning = ({disksToCheck, disksToWarn}) => {
  const disksPassed = disksToCheck.filter(disk => !disksToWarn.includes(disk))
  const msg = new Message()
  msg
    .addWarningUsers()
    .addText('There is not enough space on some disks:')
    .addCode(disksToInfoString(disksToWarn), 'markdown')
  if (disksPassed.length) {
    msg
      .addText('Other spaces:')
      .addCode(disksToInfoString(disksPassed), 'markdown')
  }
  discord.sent(msg)
}

const noDiskHandler = () => {
  const msg = new Message('There are no disks to check:')
  msg.addCode(
    '## Configuration' + lineBreak +
    `- minSizeToCheck: ${minSizeToCheck}` + lineBreak +
    `- minCapacityToWarn: ${minCapacityToWarn}` + lineBreak +
    `- maxAvailableToWarn: ${maxAvailableToWarn}` + lineBreak +
    (
      ignoreMount.length === 0
        ? `- ignoreMount: empty`
        : (
          `- ignoreMount:` + lineBreak +
            ignoreMount.map(pattern => `    - ${inspect(pattern)}`).join(lineBreak)
        )
    ),
    'markdown'
  )
  discord.sent(msg)
}

const run = async () => {
  const disks = await asyncDf()
  const disksToCheck = disks
    .filter(disk => disk.size > minSizeToCheck)
    .filter(disk => ignoreMount.every(pattern => typeof pattern === 'string' ? disk.mount !== pattern : !disk.mount.match(pattern)))
  const disksToWarn = disksToCheck.filter(disk => disk.capacity > minCapacityToWarn || disk.available < maxAvailableToWarn)

  if (disksToCheck.length === 0) {
    noDiskHandler()
  } else if (disksToWarn.length === 0) {
    success(disksToCheck)
  } else {
    warning({disksToCheck, disksToWarn})
  }
}

module.exports = {
  run
}

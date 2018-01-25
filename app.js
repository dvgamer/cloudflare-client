const request = require('request-promise')
const moment = require('moment')
const cron = require('cron')

if (!process.env.DNS_UPDATE) throw new Error(`Required 'DNS_UPDATE' environment.`)
if (!process.env.DOMAIN_NAME) throw new Error(`Required 'DOMAIN_NAME' environment.`)

const toSeconds = hr => {
  let seconds = (hr[0] + (hr[1] / 1e9)).toFixed(3)
  return seconds
}

const ipAddrUpdate = async domain => {
  let begin = process.hrtime()
  let api = await request({
    url: 'https://api.ipify.org?format=json',
    json: true
  })
  let updated = await request({
    method: 'POST',
    url: process.env.DNS_UPDATE,
    json: true,
    body: { domain: domain, addr: api.ip }
  })
  if (updated.err) {
    console.log(`[couldfare.com] '${updated.err}' `)
  } else {
    console.log(`[couldfare.com] Updated '${domain}' at ${moment().format('YYYY-MM-DD HH:mm:ss')} IP:'${api.ip}' (${toSeconds(process.hrtime(begin))}s)`)
  }
}

ipAddrUpdate(process.env.DOMAIN_NAME).catch(ex => {
  console.log(`[couldfare.com] '${ex.message}' `)
})

let addrUpdateTime = '30 * * * *'
let jobUpdated = new cron.CronJob({
  cronTime: addrUpdateTime,
  onTick: () => {
    ipAddrUpdate(this, process.env.DOMAIN_NAME).catch(ex => {
      console.log(`[couldfare.com] '${ex.message}' `)
    })
  },
  start: true,
  timeZone: 'Asia/Bangkok'
})
console.log(`[couldfare.com] corntab(${addrUpdateTime}) ${jobUpdated.running ? 'started' : 'stoped'}.`)

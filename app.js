const request = require('request-promise')
const moment = require('moment')
const cron = require('cron')

const ipAddrUpdate = async (domain) => {
  console.time(`[couldfare.com] Updated Domain '${domain}'`)
  let api = await request({
    url: 'https://api.ipify.org?format=json',
    json: true
  })
  await request({
    method: 'POST',
    url: 'https://touno.co/api/dns/update-ip',
    json: true,
    body: {
      domain: domain,
      addr: api.ip
    }
  })
  console.timeEnd(`[couldfare.com] Updated Domain '${domain}'`)
  console.log(`[couldfare.com] at ${moment().format('YYYY-MM-DD HH:mm:ss')} IP:'${api.ip}'`)
  console.log(`[couldfare.com] -----------------------------------------`)
}

ipAddrUpdate('pc.touno.co')

let addrUpdateTime = '30 * * * *'
console.log(`[couldfare.com] corntab(${addrUpdateTime}) started.`)
let addrUpdateJob = new cron.CronJob({
  cronTime: addrUpdateTime,
  onTick: ipAddrUpdate.bind(this, 'pc.touno.co'),
  start: true,
  timeZone: 'Asia/Bangkok'
})


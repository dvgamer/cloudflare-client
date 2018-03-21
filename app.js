const request = require('request-promise')
const moment = require('moment')
const cron = require('cron')
const { Raven } = require('touno.io')

const ipAddrUpdate = async domain => {
  let begin = process.hrtime()
  let api = await request({
    url: 'https://api.ipify.org?format=json',
    json: true
  })
  
  if (!process.env.DOMAIN_KEY) throw new Error(`Required 'DOMAIN_KEY' environment.`)
  if (!process.env.DOMAIN_EMAIL) throw new Error(`Required 'DOMAIN_EMAIL' environment.`)

  const zone = process.env.DOMAIN_ZONE
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Key': process.env.DOMAIN_KEY,
    'X-Auth-Email': process.env.DOMAIN_EMAIL
  }
  let getRecords = await request({
    url: `https://api.cloudflare.com/client/v4/zones/${zone}/dns_records?name=${domain}`,
    headers: headers,
    json: true
  })
  if (!getRecords.success) throw new Error(`Not found record name '${domain}'`)
  let putRecords = await request({
    method: 'PUT',
    url: `https://api.cloudflare.com/client/v4/zones/${zone}/dns_records/${getRecords.result[0].id}`,
    headers: headers,
    body: { type: getRecords.result[0].type, name: domain, content: api.ip },
    json: true
  })
  if (!putRecords.success) throw new Error(`Can't PUT record name '${domain}'`)
  console.log(`[couldfare.com] Updated '${domain}' at ${moment().format('YYYY-MM-DD HH:mm:ss')} IP:'${api.ip}' (${toSeconds(process.hrtime(begin))}s)`)
}

console.log(`[couldfare.com] Watch and updated '${process.env.DOMAIN_NAME}'.`)
ipAddrUpdate(process.env.DOMAIN_NAME).catch(Raven)

let addrUpdateTime = '30 * * * *'
let jobUpdated = new cron.CronJob({
  cronTime: addrUpdateTime,
  onTick: () => { ipAddrUpdate(process.env.DOMAIN_NAME).catch(Raven) },
  start: true,
  timeZone: 'Asia/Bangkok'
})
console.log(`[couldfare.com] corntab(${addrUpdateTime}) ${jobUpdated.running ? 'started' : 'stoped'}.`)

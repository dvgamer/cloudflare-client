import request from 'request-promise'
import moment from 'moment'
import { CronJob } from 'cron'
import { Raven } from 'touno.io'

if (!process.env.DOMAIN_NAME) throw new Error(`Required 'DOMAIN_NAME' environment.`)
if (!process.env.DOMAIN_ZONE) throw new Error(`Required 'DOMAIN_ZONE' environment.`)

const ipAddrUpdate = async domain => {
  // let begin = process.hrtime()
  let api = await request({
    url: 'https://api.ipify.org?format=json',
    json: true
  })

  if (!process.env.DOMAIN_KEY) throw new Error(`Required 'DOMAIN_KEY' environment.`)
  if (!process.env.DOMAIN_EMAIL) throw new Error(`Required 'DOMAIN_EMAIL' environment.`)

  const zone = process.env.DOMAIN_ZONE
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Key': process.env.DOMAIN_KEY.trim(),
    'X-Auth-Email': process.env.DOMAIN_EMAIL.trim()
  }
  let getRecords = await request({
    url: `https://api.cloudflare.com/client/v4/zones/${zone}/dns_records?name=${domain}`,
    headers: headers,
    timeout: 1000,
    json: true
  })
  if (!getRecords.success) throw new Error(`Not found record name '${domain}'`)
  if (api.ip !== getRecords.result[0].content) {
    let putRecords = await request({
      method: 'PUT',
      url: `https://api.cloudflare.com/client/v4/zones/${zone.trim()}/dns_records/${getRecords.result[0].content}`,
      headers: headers,
      body: { type: getRecords.result[0].type, name: domain, content: api.ip },
      json: true
    })
    if (!putRecords.success) throw new Error(`Can't PUT record name '${domain}'`)
    console.log(`[couldfare.com] Updated '${domain}' at ${moment().format('YYYY-MM-DD HH:mm:ss')} IP:'${api.ip}'.`)
  }
}

ipAddrUpdate(process.env.DOMAIN_NAME).catch(Raven)
let jobUpdated = new CronJob({
  cronTime: '30 * * * *',
  onTick: () => { ipAddrUpdate(process.env.DOMAIN_NAME).catch(Raven) },
  start: true,
  timeZone: 'Asia/Bangkok'
})
console.log(`[couldfare.com] Watch and updated '${process.env.DOMAIN_NAME}' ${jobUpdated.running ? 'started' : 'stoped'}.`)

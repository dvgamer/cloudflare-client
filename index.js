import request from 'request-promise'
import consola from 'consola'
import moment from 'moment'
// import { CronJob } from 'cron'

const dev = (process.env.NODE_ENV !== 'production')
const debug = {
  log (...msg) {
    if (!dev) return
    console.log(' ', ...msg)
  },
  start (...msg) {
    if (!dev) return
    consola.start(msg.join(' '))
  },
  success (...msg) {
    if (!dev) return
    consola.success(msg.join(' '))
  },
  info (...msg) {
    if (!dev) return
    consola.info(msg.join(' '))
  },
  error (...msg) {
    if (!dev) return
    consola.error(msg.join(' '))
  }
}

if (!process.env.DOMAIN_NAME) throw new Error(`Required 'DOMAIN_NAME' environment.`)
if (!process.env.DOMAIN_ZONE) throw new Error(`Required 'DOMAIN_ZONE' environment.`)
let getRecords = null

const ipAddrUpdate = async domain => {
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
  debug.start(`[cloudflare.com]`, `My IP Address: ${api.ip}`)
  if (!getRecords || !getRecords.success) {
    getRecords = await request({
      url: `https://api.cloudflare.com/client/v4/zones/${zone}/dns_records?name=${domain}`,
      headers: headers,
      timeout: 1000,
      json: true
    })

    debug[getRecords.success ? 'success' : 'error'](`[cloudflare.com]`, `DNS Verify ${getRecords.success ? 'Pass' : 'Fail'}.`)
    if (!getRecords.success) throw new Error(`Not found record name '${domain}'`)
    getRecords = getRecords.result[0]
  }
  debug.log(`[cloudflare.com]`, `DNS: ${getRecords.content} ${api.ip !== getRecords.content ? 'Updating...' : 'Ignore'}.`)
  const endpointPutRecords = `https://api.cloudflare.com/client/v4/zones/${zone.trim()}/dns_records/${getRecords.id}`
  if (api.ip !== getRecords.content) {
    let putRecords = await request({
      method: 'PUT',
      url: endpointPutRecords,
      headers: headers,
      body: { type: getRecords.type, name: domain, content: '171.6.26.242' },
      json: true
    })
    debug[putRecords.success ? 'success' : 'error'](`[cloudflare.com]`, `DNS Updated ${putRecords.success ? 'Pass' : 'Fail'}.`)
    if (!putRecords.success) throw new Error(`Can't PUT record name '${domain}'`)
    getRecords.content = api.ip
    debug.log(`[couldfare.com]`, `DNS: '${domain}' IP:'${api.ip}' Updated at ${moment().format('YYYY-MM-DD HH:mm:ss')}.`)
  }
}

ipAddrUpdate(process.env.DOMAIN_NAME).catch(debug.error)
// let jobUpdated = new CronJob({
//   cronTime: '30 * * * *',
//   onTick: () => { ipAddrUpdate(process.env.DOMAIN_NAME).catch(debug.error) },
//   start: true,
//   timeZone: 'Asia/Bangkok'
// })

// console.log(`[couldfare.com] Watch and updated '${process.env.DOMAIN_NAME}' ${jobUpdated.running ? 'started' : 'stoped'}.`)

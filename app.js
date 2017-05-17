const express = require('express')
const request = require('request-promise')
var app = express()


console.time('checkip')
request({
	method: 'GET',
	url: 'https://api.ipify.org?format=json',
	json: true
}).then(res => {
	console.timeEnd('checkip')
	console.log('ipaddr', res)
	return request.put({
		url: 'https://api.cloudflare.com/client/v4/zones/b47ab1d676a910f9acfb3efe48938a59/dns_records/e0ecd8c8687432da092701fb15714569',
		headers: {
			'Content-Type':'application/json',
			'X-Auth-Key':'541b7ac1734bfa838079b8908b31f49fa9262',
			'X-Auth-Email':'info.dvgamer@gmail.com',
		},
		body: { "type":"A","name":"pc.touno.co","content": res.ip} ,
		json: true,
	})
}).then(function(res){
	console.log('cloudflare', res.result)
}).catch(function(ex){
	console.log('catch', ex.message)
})

// {"type":"A","name":"pc.touno.co","content": res.ip}
// /Address:.([\d\.]+)/ig.exec(

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
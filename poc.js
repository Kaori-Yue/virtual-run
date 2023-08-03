'use strict';

const http = require('http');
const crypto = require('crypto')
const util = require('util')
const scryptAsync = util.promisify(crypto.scrypt)
const timeoutAsync = util.promisify(setTimeout)

const s = 'qw2aesfsg'
const msg = 'asedfedr;kflhdrskf;gjrftdgbd'
const server = http.createServer(async (req, res) => {
	res.setHeader('Content-Type', 'text/html');

	if (req.url === '/quick-api') {
		return res.end('<h1>This API must return immediately.</h1>');
	}
	if (req.url === '/slow-sync-api') {
		let c = 'q'

		for (let i = 0; i < 10000000; i++)
			c = c + i
			// c = await sS()
		// c = crypto.scryptSync(msg, s, 64)
		return res.end(c)
	}
	if (req.url === '/slow-async-api') {
		let cc = ''
		// await timeoutAsync(5000)
		for (let i = 0; i < 100; i++)
			cc = await scryptAsync(msg, s, 64).then(toString('hex'))
		res.end(cc)
	}
})

server.listen(4000, () => {
	console.log(`Server is listening`);
})

async function sS() {
	return new Promise(reslove => reslove(crypto.scryptSync(msg, s, 64).toString('hex')))
	// return crypto.scryptSync(msg, s, 64).toString('hex')
}
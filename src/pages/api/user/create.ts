// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db } from "@/db"
import {scrypt} from 'crypto'
import {promisify} from 'util'
const scryptAsync = promisify(scrypt)




type Data = {
	name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	console.log("h", req.headers)
	console.log("body", req.body)
	console.log("q", req.query)
	const { method } = req
	switch (method) {
		case "GET":
			res.status(200).json({ name: "GET200" })
			break

		case "POST":
			// res.status(200).json({ name: "POST200" })
			// await createRole()
			// await signUp()
			const { email, password } = req.body as { email?: string, password?: string}
			if (!(email && password))
				return res.status(200).json({ name: 'NULL' })
			const status = await signUp(email, password)
			status 
				? res.status(200).json({ name: "POST200" }) 
				: res.status(200).json({ name: process.env.PASSWORD_SALT })
			break
		default:
			break
	}
	// res.status(200).json({ name: "John Doe" })
}

async function signUp(email: string, password: string) {
	try {
		console.log('HASH')
		console.log(typeof password)
		// result of keylen 64 -> hex = 128 char
		const password_hash = await (scryptAsync(`${password}`, process.env.PASSWORD_SALT, 64) as Promise<Buffer>).then(s => s.toString('hex'))
		console.log(password_hash)
		// return true
		// const q = await db.user.create({
		// 	data: {
		// 		email: email,
		// 		password: password_hash,

		// 		accounts: {
		// 			connectOrCreate: {
		// 				where: {}
		// 			}
		// 		}
		// 	},
		// })
		const q = await db.account.create({
			data: {
				provider: 'local',
				providerAccountId: 'n/a',
				type: 'credentials',
				user: {
					connectOrCreate: {
						where: {email: email},
						create: {
							email: email,
							password: password_hash
						}
					}
				}
			}
		})
		return true
	} catch (e) {
		// if (e instanceof Prisma.PrismaClientKnownRequestError) {
		// 	if (e.code === '') {}
		// }
		console.log(e)
		return false
	}
}

// async function createRole() {
// 	const q = await db.role.create({
// 		data: {
// 			name: "root",
// 		},
// 	})
// 	console.log(q)
// }

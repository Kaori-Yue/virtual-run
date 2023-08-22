// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db, User } from "@/db"
import { scrypt } from "crypto"
import { promisify } from "util"
import { apiSwitchHandler } from "@/utils/api"
const scryptAsync = promisify(scrypt)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req

	await apiSwitchHandler(req, res, {
		POST: signUp,
	})
}

async function signUp(req: NextApiRequest, res: NextApiResponse<{ success: boolean; message?: string }>) {
	const { email, password } = req.body as { email?: string; password?: string }
	if (!(email && password)) return res.status(400).end()

	// result of keylen 64 -> hex = 128 char
	try {
		const password_hash = await (scryptAsync(`${password}`, process.env.PASSWORD_SALT, 64) as Promise<Buffer>).then((s) => s.toString("hex"))
		// const user = await db.account.create({
		// 	data: {
		// 		provider: "local",
		// 		providerAccountId: "n/a",
		// 		type: "credentials",
		// 		user: {
		// 			connectOrCreate: {
		// 				where: { email: email },
		// 				create: {
		// 					email: email,
		// 					password: password_hash,
		// 				},
		// 			},
		// 		},
		// 	},
		// })
		const user = await db.user.create({
			data: {
				email: email,
				password: password_hash,
			}
		})

		if (!user) return res.status(500).end()
		return res.json({ success: true })
	} catch (e) {
		console.log(email, password)
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			if (e.code === "P2002") return res.json({ success: false, message: "email dup" })
		}
		return res.status(503).end()
	}
}

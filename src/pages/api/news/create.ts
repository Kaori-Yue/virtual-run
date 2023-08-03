// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { getToken } from "next-auth/jwt"


// type Data = {
// 	name: string
// }

type Response = import ('@prisma/client').News

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
	const { method } = req
	switch (method) {
		// case "GET":
		// 	res.status(200).json({ name: "GET200" })
		// 	break

		case "POST":
			// res.status(200).json({ name: "POST200" })
			// await createRole()
			// await signUp()
			const token = await getToken({ req })
			if (!token) {
				return res.status(401).end()
				// return res.end()
			}
			if (token.role === 'USER') {
				return res.status(401).end()
			}
			console.log(token)
			// return res.status(200).end()
			if (token?.sub === undefined) {
				return res.status(400).end()
			}
			const { title, content } = req.body as { title?: string, content?: string }
			// createEvent(title, content, token.sub)
			// const status = await createEvent()
			// status 
			// 	? res.status(200).json({ name: "POST200" }) 
			// 	: res.status(200).json({ name: process.env.PASSWORD_SALT })
			// createEvent(title, content, token.sub)
			// 	.then(succ => res.json(succ))
			// 	.catch(err => {
			// 		console.log(err)
			// 		res.status(500).end()
			// 	})
			break
		default:
			res.status(403).end()
			break
	}
	// res.status(200).json({ name: "John Doe" })
	//res.status(403).end()
}

// async function createEvent(title = "n/a", content = "n/a", userId: string) {
// 	return db.news.create({
// 		data: {
// 			active: true,
// 			content: content,
// 			title: title,
// 			userId: userId
// 		}
// 	})
// }

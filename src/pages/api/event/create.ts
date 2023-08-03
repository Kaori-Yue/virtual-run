import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { getToken } from "next-auth/jwt"
import { Prisma } from "@prisma/client"

type Response = import("@prisma/client").Event

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
			if (token.role === "USER") {
				return res.status(403).end()
			}
			console.log(token)
			// return res.status(200).end()
			if (token?.sub === undefined) {
				return res.status(400).end()
			}
			const payload = req.body as Omit<Payload, 'userId'>
			// console.log(payload)
			// check(payload)
			console.log(JSON.stringify(payload))
			
			return createEvent({ ...payload, userId: token.sub})
				.then(s => res.send(s))
				.catch(e => {
					console.error(e)
					return res.status(503).end()
				})
			// return res.status(200).end()
			break
		default:
			res.status(403).end()
			break
	}
	// res.status(200).json({ name: "John Doe" })
	//res.status(403).end()
}


type Payload = Pick<Response, "title" | "content" | "thumbnail" | "register_startdate" | "register_enddate" | "userId">
function createEvent(payload: Payload) {
	return db.event.create({
		data: {
			...payload,
			active: true,
		},
	})
}

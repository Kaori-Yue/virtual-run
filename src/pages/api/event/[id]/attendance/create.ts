import type { NextApiRequest, NextApiResponse } from "next"
import { db, Event_Logs } from "@/db"
import { getToken } from "next-auth/jwt"
import { Prisma } from "@prisma/client"
import { includeKeys } from "@/utils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	switch (method) {
		case "GET":
			console.log("GET")
			console.log(req.query)
			res.status(404).end()
			break
		case "POST":
			const token = await getToken({ req })
			const _id = req.query.id // id event
			if (_id === undefined || token === null) {
				res.status(404).end()
				break
			}
			const id = +_id
			if (Number.isNaN(id)) {
				console.log('num is nan', id)
				res.status(404).end()
				break
			}
			// return res.status(200).end()
			if (token?.sub === undefined) {
				return res.status(400).end()
			}
			const payload = req.body as Omit<Payload, "userId" | "eventId">
			// console.log(payload)
			// check(payload)
			console.log(JSON.stringify(payload))
			// console.log('e:', req.)
			return createEventLog({
				...payload, 
				userId: token.sub,
				eventId: id
			  })
				.then((s) => res.send(s))
				.catch((e) => {
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

type Payload = Pick<Event_Logs, "distance" | "screenshot" | "eventId" | "userId" | 'duraion'>
function createEventLog(payload: Payload) {
	console.log('create, payload:', payload)
	return db.event_Logs.create({
		data: {
			...payload,
		},
	})
}

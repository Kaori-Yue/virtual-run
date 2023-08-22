import { db, Event } from "@/db"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"
import timers from 'timers/promises'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: get,
	})
}

//

export type { Event }
async function get(req: NextApiRequest, res: NextApiResponse<Event>) {
	const id = req.query.id
	if (typeof id !== "string") {
		return res.status(404).end()
	}
	if (!Number.isInteger(+id)) {
		return res.status(404).end()
	}

	// await timers.setTimeout(2000)
	const event = await getEventById(+id)
	if (event === null) return res.status(404).end()
	return res.json(event)
}


export async function getEventById(id: number) {
	const event = await db.event.findUnique({
		where: {
			id: id
		},
	})
	return event
}

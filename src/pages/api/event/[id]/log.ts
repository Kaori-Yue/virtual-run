import { db, Event } from "@/db"
import { Prisma } from '@prisma/client'
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(get),
	})
}

//

type Wrapper<T1> = Success<T1> | Error
type Error = {
	success: false
	errors: z.ZodFormattedError<unknown>
}
type Success<T1> = {
	success: true
	data: T1
}
export type { Event }
async function get(req: NextApiRequest, res: NextApiResponse<Wrapper<Event>>) {
	const id = req.query.id
	const v = await z.coerce.number().parseAsync(id)
	// if (v.success === false) {
	// 	return res.status(500).json({ success: false, errors: v.error.format() })
	// }

	// await timers.setTimeout(2000)
	const event = await getEventLogById(v)
	if (event === null) return res.status(404).end()
	return res.json({
		success: true,
		data: event,
	})
}


export async function getEventLogById(id: number) {
	const _event = Prisma.validator<Prisma.EventInclude>()({
		_count: true,
		ActivitiesOnEvents: {
			include: { Activity: true }
		}
	})
	const event = await db.event.findUnique({
		where: {
			id: id,
		},
		include: _event
	})
	return event
	
}


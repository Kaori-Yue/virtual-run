import { db, Event } from "@/db"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getEvent,
	})
}

//

export type EventList = {
	items: Event[]
	meta: MetaPage
}
async function getEvent(req: NextApiRequest, res: NextApiResponse<EventList>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const [data, total] = await Promise.all([
		db.event.findMany({
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
		}),
		db.event.count()
	])
	const lastPage = Math.ceil(total / limit)
	res.status(200).json({
		items: data,
		meta: {
			totalItem: total,
			lastPage,
			currentPage: page,
			perPage: limit,
			prev: page > 1 ? page - 1 : null,
			next: page < lastPage ? page + 1 : null,
		}
	})
}


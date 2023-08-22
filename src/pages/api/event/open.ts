import { db, Event } from "@/db"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getEventWithRangeTime,
	})
}

//

export type EventListWithRangeTime = {
	items: Event[]
	meta: MetaPage
}
async function getEventWithRangeTime(req: NextApiRequest, res: NextApiResponse<EventListWithRangeTime>) {
	// TODO: handle range time in query
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const start = req.query.start as unknown as Date 
	const end = req.query.end as unknown as Date 
	console.log('LOG:',start, end)
	const [data, total] = await Promise.all([
		db.event.findMany({
			where: {
				// register_startdate: { lte: new Date },
				// register_enddate: { gte: new Date },
				// 
				// register_startdate: { gte: start },
				// register_enddate: { lte: end }
				// 
				// https://stackoverflow.com/questions/74096682/find-date-range-in-prisma-orm
				OR: [
					{ register_startdate: { lte: end }, register_enddate: { gte: start } },
					{ register_startdate: { gte: start }, register_enddate: { lte: end } }
				]
			},
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


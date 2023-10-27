import { db, Event } from "@/db"
import { Prisma } from "@prisma/client"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		// GET: getEvent,
		GET: getEventV2,
	})
}

//
type _Event = Event & {
	isOpen: boolean
}
export type EventList = {
	items: _Event[]
	meta: MetaPage
}

async function getEventV2(req: NextApiRequest, res: NextApiResponse<EventList>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	// case when register_startdate >= CURDATE() OR register_enddate <= CURDATE() then TRUE else FALSE end as isOpen
	const [data, total] = await Promise.all([
		db.$queryRaw`select *, 
		case when CURDATE() >= register_startdate AND CURDATE() <= register_enddate then TRUE else FALSE end as isOpen
		from Event
		where active=true
		order by isOpen desc, id desc
		limit ${Prisma.sql`${limit}`}
		offset ${Prisma.sql`${page > 0 ? (page - 1) * limit : 0}`}
		` as Promise<_Event[]>,
		// db.event.findMany({
		// 	take: limit,
		// 	skip: page > 0 ? limit * (page - 1) : 0,
		// 	where: { active: true },
		// 	orderBy: { created_at: 'desc' }
		// }),
		db.event.count({ where: { active: true } }),
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
		},
	})
}

// async function getEvent(req: NextApiRequest, res: NextApiResponse<EventList>) {
// 	const limit = Number(req.query.limit) || 10
// 	const page = Number(req.query.page) || 1
// 	const [data, total] = await Promise.all([
// 		db.event.findMany({
// 			take: limit,
// 			skip: page > 0 ? limit * (page - 1) : 0,
// 			where: { active: true },
// 			orderBy: { created_at: 'desc' }
// 		}),
// 		db.event.count({ where: { active: true } }),
// 	])
// 	const lastPage = Math.ceil(total / limit)
// 	res.status(200).json({
// 		items: data,
// 		meta: {
// 			totalItem: total,
// 			lastPage,
// 			currentPage: page,
// 			perPage: limit,
// 			prev: page > 1 ? page - 1 : null,
// 			next: page < lastPage ? page + 1 : null,
// 		},
// 	})
// }

import { db, Event } from "@/db"
import { Prisma } from "@prisma/client"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { InferGetServerSidePropsType, NextApiRequest, NextApiResponse } from "next/types"
import { never, z } from "zod"
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

type GenericOfNextApiResponse<T> = T extends NextApiResponse<infer X> ? X : never
type inferNextApiResponse<T extends (req: NextApiRequest, res: NextApiResponse) => unknown> = GenericOfNextApiResponse<Awaited<ReturnType<T>>>
export type ReturnType_Rank = inferNextApiResponse<typeof get>

async function get(req: NextApiRequest, res: NextApiResponse<Wrapper<Data>>) {
	const id = req.query.id
	const v = await z.coerce.number().parseAsync(id)
	const uid = req.query.userId as string
	// if (v.success === false) {
	// 	return res.status(500).json({ success: false, errors: v.error.format() })
	// }

	// await timers.setTimeout(2000)
	// const event = await getEventLogById(v)
	const event = await getRank(v, uid)
	// const test = await db.activitiesOnEvents.findMany({
	// 	where: { eventId: v },

	// })
	// const t2 = await db.activitiesOnEvents.groupBy({
	// 	by: ['']
	// })

	// const t3 = await db.activity.groupBy({
	// 	where: {
	// 		ActivitiesOnEvents: { every: { eventId: v } },

	// 	},
	// 	by: ["userId"],
	// 	_sum: { distance: true },
	// 	_count: { distance: true },
	// 	orderBy: { _sum: { distance: "desc" } },

	// })

	// if (event === null || event.length === 0) return res.status(404).end()
	if (event === null) return res.status(404).end()
	return res.json({
		success: true,
		data: event,
	})
}

// BigInt.prototype.toJSON = function () {
// 	const int = Number.parseInt(this.toString());
// 	return int ?? this.toString();
//   };

type Data = {
	event: Pick<Event, 'id' | 'register_enddate' | 'register_startdate' | 'thumbnail' | 'title'> | null
	list: {
		distance_sum: number
		times: number
		userId: string
		email: string
		name: string | null
		image: string | null
		rank: number
	}[]
}

async function getRank(eventId: number, userId?: string): Promise<Data> {
	const query = await db.$queryRaw`
		select *
		from (
			select userId, name, email, image
			, SUM(distance) as distance_sum
			, COUNT(Activity.distance) as times
			, RANK() OVER (ORDER BY distance_sum desc) as rank
			from ActivitiesOnEvents
			left JOIN Activity ON ActivitiesOnEvents.activityId = Activity.id
			left JOIN User ON Activity.userId = User.id
			where eventId = ${eventId} and status = 'Approved'
			group by userId
			limit 10
		) as t
		${userId ? Prisma.sql`where t.userId = ${userId}` : Prisma.empty}
		order by t.rank asc
	` as Data['list']
	const event = await db.event.findUnique({
		where: { id: eventId },
		select: { id: true, title: true, thumbnail: true, register_startdate: true, register_enddate: true },
	})
	// console.log(`eventl,`, event)
	return {
		event: event,
		list: query,
	}
	// return query as Data[]
}

// sql return is best, but not sure is slower ?
/*
 with t as (
				select userId, name, email, image
				, SUM(distance) as sum_distance
				, count(Activity.distance) as count
				, RANK() OVER (ORDER BY sum_distance desc) as rank
				from ActivitiesOnEvents
				left JOIN Activity ON ActivitiesOnEvents.activityId = Activity.id
				left JOIN User ON Activity.userId = User.id
				where eventId = 1 and status = 'Approved'
				group by userId
) 

SELECT * from (
	(select * from t order by rank asc limit 1)
		UNION
	(SELECT * from t where name = 'crossknight21')
) as x
*/

export async function getEventLogById(id: number) {
	// const _event = Prisma.validator<Prisma.EventInclude>()({
	// 	_count: true,
	// 	ActivitiesOnEvents: {},
	// })
	const event = await db.$queryRaw`
	SELECT SUM(Activity.distance) as distance_sum,
	COUNT(*) as times,
	Activity.userId,
	User.email,
	User.name,
	User.image
	FROM ActivitiesOnEvents
	LEFT JOIN Activity ON ActivitiesOnEvents.activityId = Activity.id
	LEFT JOIN User ON Activity.userId = User.id
	WHERE ActivitiesOnEvents.eventId = ${id}
		AND ActivitiesOnEvents.status = "Approved"
	GROUP BY Activity.userId
	ORDER BY distance_sum DESC
	`
	// const event = await db.event.groupBy({
	// 	by: ['userId'],
	// 	where: { id: id },
	// })
	console.log(event)
	return event as Data[]
}

/*
,
*/

// SELECT SUM(project.Event_Logs.distance) as distance_sum,
// CAST(COUNT(*) as INT) as attendance,
// project.Event_Logs.userId,
// project.User.name
// FROM project.Event_Logs LEFT JOIN User ON project.Event_Logs.userId = project.User.id
// WHERE project.Event_Logs.eventId = ${id} GROUP BY project.Event_Logs.userId`

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

type GenericOfNextApiResponse<T> = T extends NextApiResponse<infer X> ? X : never;
type inferNextApiResponse<T extends (req: NextApiRequest, res: NextApiResponse) => unknown> = GenericOfNextApiResponse<Awaited<ReturnType<T>>>
export type ReturnType_Rank = inferNextApiResponse<typeof get>

async function get(req: NextApiRequest, res: NextApiResponse<Wrapper<Data[]>>) {
	const id = req.query.id
	const v = await z.coerce.number().parseAsync(id)
	// if (v.success === false) {
	// 	return res.status(500).json({ success: false, errors: v.error.format() })
	// }

	// await timers.setTimeout(2000)
	const event = await getEventLogById(v)
	if (event === null || event.length === 0) return res.status(404).end()
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
	distance_sum: number
	times: number
	userId: string
	email: string
	name: string | null
}
export async function getEventLogById(id: number) {
	const _event = Prisma.validator<Prisma.EventInclude>()({
		_count: true,
		ActivitiesOnEvents: {},
	})
	const event = await db.$queryRaw`
	SELECT SUM(Activity.distance) as distance_sum,
	COUNT(*) as times,
	Activity.userId,
	User.email,
	User.name
	FROM ActivitiesOnEvents
	LEFT JOIN Activity ON ActivitiesOnEvents.activityId = Activity.id
	LEFT JOIN User ON Activity.userId = User.id
	WHERE ActivitiesOnEvents.eventId = ${id} GROUP BY Activity.userId
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

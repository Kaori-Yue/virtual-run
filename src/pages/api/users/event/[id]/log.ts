// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { ActivitiesOnEvents, Prisma } from "@prisma/client"
import { db, Event } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"
import { z } from "zod"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(getEventByUser),
		POST: withExceptions(setAttachEventStatus),
	})
}

const ActivitiesInclude = Prisma.validator<Prisma.ActivitiesOnEventsInclude>()({
	Activity: { include: {
		User: {
			select: {
				id: true,
				email: true,
				name: true,
				image: true
			}
		}
	} }
})

// export type LogEventById = PaginatedResult<Prisma.ActivitiesOnEventsGetPayload<{ include: { Activity: true } }>>
export type LogEventById = PaginatedResult<Prisma.ActivitiesOnEventsGetPayload<{include: typeof ActivitiesInclude}>>

async function getEventByUser(req: NextApiRequest, res: NextApiResponse<LogEventById>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	const [data, total] = await Promise.all([
		// db.event.findUnique({
		// 	where: { id: +(req.query.id as string) },
		// 	include: {
		// 		ActivitiesOnEvents: {
		// 			include: {
		// 				Activity: {
		// 					include: {
		// 						User: true
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }),
		db.activitiesOnEvents.findMany({
			where: { eventId: +(req.query.id as string) },
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
			include: ActivitiesInclude,
			// include: { Activity: { include: { User: {
			// 	select: {
			// 		id: true,
			// 		email: true,
			// 		name: true,

			// 	}
			// } } } },
			orderBy: { Activity: { updated_at: "desc" } }
		}),

		db.activitiesOnEvents.count({ where: { eventId: +(req.query.id as string) } }),
	])
	const lastPage = Math.ceil(total / limit)
	if (!data) return res.status(404).end()
	// await timers.setTimeout(3000)
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

async function setAttachEventStatus(req: NextApiRequest, res: NextApiResponse<ActivitiesOnEvents>) {
	const eventId = await z.coerce.number().parseAsync(req.query.id)
	const payload = await z
		.object({
			status: z.enum(["Approved", "Pending", "Reject"]),
			activityId: z.string().cuid(),
		})
		.parseAsync(req.body)
	const token = await getToken({ req })
	if (!token) return res.status(401).end()
	// TODO: check perm of user
	const attach = await db.activitiesOnEvents.update({
		where: {
			// activityId: req.query.id as string,
			// eventId: +(req.query.eventId as string),
			activityId_eventId: {
				activityId: payload.activityId,
				eventId: eventId,
			},
			Event: {
				userId: token.role === 'ROOT' ? undefined : token.sub
			}
		},
		data: {
			status: payload.status,
		},
	})
	return res.json(attach)
}

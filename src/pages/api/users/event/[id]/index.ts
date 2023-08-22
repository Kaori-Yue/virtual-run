// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db, Event } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"
import { z } from "zod"
import { createPayload } from "../index"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(getEventByUser),
		PUT: withExceptions(async (req, res) => {
			const id = await z.coerce.number().parseAsync(req.query.id)
			const payload = await createPayload.parseAsync(req.body)
			const update = await updateEventById(id, payload)
			return res.json({
				success: true,
			})
		}),
	})
}

function updateEventById(id: number, payload: z.infer<typeof createPayload>) {
	return db.event.update({
		where: { id },
		data: { ...payload }
	})
}

export type LogEventById = PaginatedResult<Prisma.ActivitiesOnEventsGetPayload<{ include: { Activity: true } }>>
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
			include: { Activity: true },
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

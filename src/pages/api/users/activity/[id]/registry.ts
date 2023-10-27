// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import type { Event, Prisma } from "@prisma/client"
import { db, Activity } from "@/db"
import { getToken } from "next-auth/jwt"
import { apiSwitchHandler } from "@/utils/api"
import { withExceptions } from "@/utils/api/withExceptions"
import { z } from "zod"

export type UserRegistry = Event[]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(async (req, res) => {
			const eventId = await z.coerce.string().cuid().parseAsync(req.query.id)
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			const activity = await db.activity.findUnique({ where: { userId: token.sub, id: eventId } })
			if (!activity) return res.status(500).end()
			const events = await db.registryEvent.findMany({
				where: {
					AND: [
						{ userId: token.sub },
						{
							Event: {
								AND: [
									{ register_startdate: { lte: activity.created_at } },
									{ register_startdate: { lte: activity.assigned_at } },
									//
									{ register_enddate: { gte: activity.created_at } },
									{ register_enddate: { gte: activity.assigned_at } },
								],
							},
						},
						{
							Event: { active: true },
						},
					],
					// userId: token.sub,
					// Event: { AND: [
					// 	{ register_startdate: { lte: activity.created_at } },
					// 	{ register_startdate: { lte: activity.assigned_at }  },
					// 	//
					// 	{ register_enddate: { gte: activity.created_at } },
					// 	{ register_enddate: { gte: activity.assigned_at } }
					// ] },
				},
				select: {
					Event: true,
				},
			})
			const compact: UserRegistry = events.map((e) => e.Event)
			return res.json(compact)
		}),
	})
}

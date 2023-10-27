// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { db, Activity as Act } from "@/db"
import { getToken } from "next-auth/jwt"
import { apiSwitchHandler } from "@/utils/api"
import { withExceptions } from "@/utils/api/withExceptions"
import { z } from "zod"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(getActivityById),
		PUT: withExceptions(async (req, res) => {
			const token = await getToken({ req })
			if (!token) {
				return res.status(401).end()
			}
			const paylaod = await z
				.object({
					distance: z.coerce.number(),
					duration: z.coerce.number(),
					screenshot: z.string(),
				})
				.parseAsync(req.body)
			const id = await z.string().cuid().parseAsync(req.query.id)
			const update = await db.activity.update({
				where: { id: id, userId: token.sub },
				data: {
					...paylaod,
					ActivitiesOnEvents: {
						updateMany: {
							where: { activityId: id },
							data: { status: "Pending" },
						},
						// update: {
						// 	// where: { activityId: id },
						// 	where: { activityId_eventId: { activityId: '', eventId: 6} },
						// 	data: {
						// 		status: 'Pending'
						// 	}
						// }
					},
				},
			})
			return res.json(update)
		}),
	})
}

// type GetActivityById = Activity
export type ActivityWithAttached = Prisma.ActivityGetPayload<{ include: { ActivitiesOnEvents: true } }>
async function getActivityById(req: NextApiRequest, res: NextApiResponse<ActivityWithAttached>) {
	const registry = await z
		// .enum(["true", "false", ''])
		.string()
		.optional()
		.transform((v) => {console.log('v: ' + v); return v === "true" || v === ''})
		.parseAsync(req.query.registry)
	const activity = await db.activity.findUnique({
		where: { id: req.query.id as string },
		// include: { _count: true  }
		include: { ActivitiesOnEvents: registry ? true : false },
	})
	if (!activity) return res.status(404).end()
	activity.ActivitiesOnEvents
	return res.json(activity)
}

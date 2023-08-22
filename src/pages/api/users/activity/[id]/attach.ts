// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { db, Activity } from "@/db"
import { getToken } from "next-auth/jwt"
import { apiSwitchHandler } from "@/utils/api"
import { withExceptions } from "@/utils/api/withExceptions"

type PayloadRequest = {
	eventId: number
	activityId: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getActivitiesWithAttached,
		POST: withExceptions(attachEvent),
	})
}


async function attachEvent(req: NextApiRequest, res: NextApiResponse) {
	const payload = req.body as PayloadRequest
	const token = await getToken({ req })
	if (!token) return res.status(401).end()
	// if (!ValidateNotNull(payload, ["activityId", "eventId"])) {
	// 	return res.status(400).end()
	// }
	// TODO: check perm of user
	const attach = await db.activitiesOnEvents.create({
		data: {
			activityId: req.query.id as string,
			// activityId: payload.activityId,
			eventId: payload.eventId,
		},
	})
	res.json(attach)
}

function ValidateNotNull<T1 extends Object>(payload: T1, attr: (keyof T1)[]): payload is Required<T1> {
	for (const att of attr) {
		if (Object.hasOwn(payload, att) === false) return false
	}
	return true
}

export type ActivityAttached = Prisma.ActivityGetPayload<{ include: { ActivitiesOnEvents: { include: { Event: true } } } }>
async function getActivitiesWithAttached(req: NextApiRequest, res: NextApiResponse<ActivityAttached>) {
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	const attached = await db.activity.findUnique({
		where: { id: req.query.id as string },
		include: {
			ActivitiesOnEvents: {
				include: {
					Event: true,
				},
			},
		},
	})
	if (!attached) return res.status(404).end()
	res.json(attached)
}

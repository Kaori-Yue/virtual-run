// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { db, Activity } from "@/db"
import { getToken } from "next-auth/jwt"
import { apiSwitchHandler } from "@/utils/api"
import { withExceptions } from "@/utils/api/withExceptions"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(getActivityById),
	})
}

// type GetActivityById = Activity
export type { Activity }
async function getActivityById(req: NextApiRequest, res: NextApiResponse<Activity>) {
	const activity = await db.activity.findUnique({
		where: { id: req.query.id as string }
	})
	if (!activity) return res.status(404).end()
	return res.json(activity)
}
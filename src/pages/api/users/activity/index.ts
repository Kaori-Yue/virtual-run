// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db, Activity } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"
import { z } from "zod"

type PayloadActivity = Pick<Activity, "distance" | "duration" | "screenshot">
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getActivities,
		POST: withExceptions(addActivity),
	})
}

export type ActivityList = PaginatedResult<Activity>
async function getActivities(req: NextApiRequest, res: NextApiResponse<ActivityList>) {
	// await timers.setTimeout(3000)
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	const [data, total] = await Promise.all([
		db.activity.findMany({
			where: { userId: token.sub },
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
			orderBy: { created_at: "desc" },
		}),
		db.activity.count({ where: { userId: token.sub } }),
	])
	const lastPage = Math.ceil(total / limit)
	if (!data) return res.status(404).end()
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


async function addActivity(req: NextApiRequest, res: NextApiResponse<Activity>) {
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	const payload = req.body as PayloadActivity
	const create = await db.activity.create({
		data: {
			distance: payload.distance,
			duration: payload.duration,
			screenshot: payload.screenshot,
			userId: token.sub,
			assigned_at: new Date(),
		},
	})
	return res.json(create)
}

function ValidateNotNull<T1 extends Object>(payload: T1, attr: (keyof T1)[]): payload is Required<T1> {
	for (const att of attr) {
		if (Object.hasOwn(payload, att) === false) return false
	}
	return true
}

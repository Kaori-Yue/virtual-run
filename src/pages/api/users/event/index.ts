// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"
import { boolean, z } from "zod"
import { Optional } from "@prisma/client/runtime/library"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getEventByUser,
		POST: withExceptions(async (req, res) => {
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			if (token.role === "USER") return res.status(403).end()
			const payload = await createPayload.parseAsync(req.body)
			await createEvent(payload, token.sub)
			return res.json({
				success: true,
			})
		}),
	})
}

export const createPayload = z.object({
	title: z.string(),
	content: z.string(),
	thumbnail: z.string(),
	register_startdate: z.coerce.date(),
	register_enddate: z.coerce.date(),
})
function createEvent(payload: z.infer<typeof createPayload>, userId: string) {
	return db.event.create({
		data: {
			...payload,
			userId,
			active: true,
		},
	})
}

const EventInclude = Prisma.validator<Prisma.EventInclude>()({
	user: {
		select: {
			email: true,
			name: true,
			image: true
		}
	}
})
export type EventListByUser = PaginatedResult<Optional<B, 'user'>>
// type A = Prisma.EventGetPayload<{}>
type B = Prisma.EventGetPayload<{ include: {user: { select: { email: true, name: true, image: true } } } }>
async function getEventByUser(req: NextApiRequest, res: NextApiResponse<EventListByUser>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	// const y: Prisma.EventInclude = { user: { select: { email: true, name: true, image: true } } }
	// const p = Prisma.validator<Prisma.EventInclude>()({
	// 	user: { select: { email: true, name: true, image: true } },
	// })
	const [data, total] = await Promise.all([
		db.event.findMany({
			where: token.role === "ROOT" ? undefined : { userId: token.sub },
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
			// include: y
			include: token.role === "ROOT" ? EventInclude : undefined,
			orderBy: {created_at: 'desc'}
		}),
		db.event.count(
			token.role === "ROOT"
				? undefined
				: {
						where: { userId: token.sub },
				  }
		),
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

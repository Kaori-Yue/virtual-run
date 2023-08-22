// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db, News } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { z } from "zod"
import { withExceptions } from "@/utils/api/withExceptions"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getNewsByUser,
		POST: withExceptions(async (req, res) => {
			const payload = await newsPayload.parseAsync(req.body)
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			if (token.role !== "ROOT") return res.status(403).end()
			const create = await createNews(payload, token.sub)
			return res.json({
				success: true,
			})
		}),
	})
}

const newsPayload = z.object({
	title: z.string(),
	content: z.string(),
	thumbnail: z.string(),
})

async function createNews(payload: z.infer<typeof newsPayload>, userId: string) {
	return await db.news.create({
		data: {
			active: true,
			title: payload.title,
			content: payload.content,
			thumbnail: payload.thumbnail,
			userId: userId,
		},
	})
}

export type NewsListByUser = PaginatedResult<News>
async function getNewsByUser(req: NextApiRequest, res: NextApiResponse<NewsListByUser>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).end()
	}
	const [data, total] = await Promise.all([
		db.news.findMany({
			where: { userId: token.sub },
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
		}),
		db.news.count({ where: { userId: token.sub } }),
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
		}
	})
}


function ValidateNotNull<T1 extends Object>(payload: T1, attr: (keyof T1)[]): payload is Required<T1> {
	for (const att of attr) {
		if (Object.hasOwn(payload, att) === false) return false
	}
	return true
}

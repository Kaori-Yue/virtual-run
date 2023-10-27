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
import {  createNewsPayload } from ".."

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		PUT: withExceptions(async (req, res) => {
			const id = await z.coerce.number().parseAsync(req.query.id)
			const payload = await createNewsPayload.parseAsync(req.body)
			const update = await updateNewsById(id, payload)
			return res.json(update)
		}),
		PATCH: withExceptions(async (req, res) => {
			const id = await z.coerce.number().parseAsync(req.query.id)
			const payload = await patchPayload.parseAsync(req.body)
			const update = await updateNewsById(id, payload)
			return res.json(update)
		}),
	})
}

const patchPayload = z
	.object({
		active: z.boolean(),
	})
	.partial()

function updateNewsById(id: number, payload: z.infer<typeof patchPayload | typeof createNewsPayload>) {
	return db.news.update({
		where: { id },
		data: { ...payload },
	})
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma, User } from "@prisma/client"
import { db, News } from "@/db"
import { getToken } from "next-auth/jwt"
import { MetaPage, PaginatedResult, apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { z } from "zod"
import { withExceptions } from "@/utils/api/withExceptions"
import { excludeKeys } from "@/utils"

export type UserByRole = PaginatedResult<Omit<User, "password" | "emailVerified">>
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(async (req, res) => {
			const eventId = await z.coerce.number().parseAsync(req.query.eventId)
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			// if (token.role !== "ROOT") return res.status(403).end()
			const reg = await db.registryEvent.findFirst({
				where: { AND: { userId: token.sub, eventId: eventId } }
			})
			// const secure = users.map(({ password, emailVerified, ...user }, index) => user)
			return res.json(reg)
		}),
		POST: withExceptions(async (req, res) => {
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			const payload = await z
				.object({
					eventId: z.coerce.number()
				})
				.parseAsync(req.body)
			//
			const user = await db.registryEvent.create({
				data: { eventId: payload.eventId, userId: token.sub }
			})
			// const secure = excludeKeys(user, ['password', 'emailVerified'])
			return res.json(user)
		}),
	})
}

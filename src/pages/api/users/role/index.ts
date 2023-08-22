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
			// const q = await z.enum(["user", "admin", "root"]).optional().parseAsync(req.query)
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			if (token.role !== "ROOT") return res.status(403).end()
			const { role, limit, page } = await z.object({
					role: z.enum(["USER", "ADMIN", "ROOT", "ALL"]).default("ALL"),
					limit: z.coerce.number().default(10),
					page: z.coerce.number().min(1).default(1),
				}).parseAsync(req.query)
			//
			const users = await db.user.findMany({
				where: { role: role !== "ALL" ? role : undefined },
				take: limit,
				skip: limit * (page - 1),
			})
			const secure = users.map(({ password, emailVerified, ...user }, index) => user)
			return res.json(secure)
		}),
		POST: withExceptions(async (req, res) => {
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			if (token.role !== "ROOT") return res.status(403).end()
			console.log('payload')
			console.log(req.body)
			const { role, uid, name } = await z
				.object({
					role: z.enum(["USER", "ADMIN"]),
					uid: z.string().cuid(),
					name: z.string()
				})
				.parseAsync(req.body)
			//
			const user = await db.user.update({
				where: { id: uid },
				data: {
					role: role,
					name: name
				}
			})
			const secure = excludeKeys(user, ['password', 'emailVerified'])
			return res.json(secure)
		}),
	})
}

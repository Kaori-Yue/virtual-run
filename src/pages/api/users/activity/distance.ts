// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next"
// import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { db } from "@/db"
import { getToken } from "next-auth/jwt"
import { apiSwitchHandler } from "@/utils/api"
import timers from "timers/promises"
import { withExceptions } from "@/utils/api/withExceptions"

// type TotalDistance = Prisma.GetActivityAggregateType<{ _sum: { distance: true } }>

// https://www.prisma.io/blog/satisfies-operator-ur8ys8ccq7zb
const aggregateArgs = {
	_count: { distance: true },
	_sum: { distance: true },
	_max: { distance: true },
	_min: { distance: true },
} satisfies Prisma.ActivityAggregateArgs
export type TotalDistance = Prisma.GetActivityAggregateType<typeof aggregateArgs>;

// export type TotalDistance = typeof aggregateArgs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: withExceptions(async (req, res: NextApiResponse<TotalDistance>) => {
			const token = await getToken({ req })
			if (!token) return res.status(401).end()
			const distance = await db.activity.aggregate({
				where: { userId: token.sub },
				...aggregateArgs
			})

			return res.json(distance)
		}),
	})
}

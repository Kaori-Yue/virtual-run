import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next/types"
import { Role, Prisma } from "@prisma/client"
import { ZodError } from "zod"

export async function allowRoute(req: NextApiRequest, res: NextApiResponse, roles: Role[]) {
	const token = await getToken({ req })
	if (!token) {
		console.error("allowRoute token null")
		return
	}
	if (roles.includes(token.role)) {
	} else {
		return res.status(403).end()
	}
}


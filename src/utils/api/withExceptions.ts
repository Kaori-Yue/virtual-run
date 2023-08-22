import { Prisma } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next/types"
import { ZodError } from "zod"

// some -> user,admin
// export async function withAuth(req: NextApiRequest, res: NextApiResponse) {
// }
// https://dev.to/mk/nextjs-little-decorator-higher-order-function-to-handle-prisma-errors-e5j

export function withExceptions(request: (req: NextApiRequest, res: NextApiResponse) => unknown) {
	return async function (req: NextApiRequest, res: NextApiResponse) {
		try {
			await request(req, res)
		} catch (e) {
			console.log(e)
			const handler: ((e: unknown) => ErrorResponse)[] = [zodError, prismaError]
			for (const fn of handler) {
				const f = fn(e)
				if (f) {
					return res.status(f.status ?? 503).json(f.message)
				}
			}

			return res.status(503).json({ error: true })
		}
	}
}

type ErrorResponse = {
	status?: number
	message: string | object
} | void
function prismaError(e: unknown): ErrorResponse {
	if (e instanceof Prisma.PrismaClientKnownRequestError) {
		return {
			message: process.env.NODE_ENV !== "production" ? `${e.code} ${e.message}` : "prisma_error",
		}
		// return res.status(503).json(errorResponse)
	}
}

function zodError(e: unknown): ErrorResponse {
	if (e instanceof ZodError) {
		return {
			message: e.format(),
		}
	}
}

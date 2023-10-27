import { NextApiRequest, NextApiResponse } from "next/types"

export * from "./auth"

type HTTP_METHODS = "GET" | "POST" | "PUT" | "PATCH"
type SwitchHandler = {
	[key in HTTP_METHODS]?: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | void
}
export const apiSwitchHandler = async (req: NextApiRequest, res: NextApiResponse, handler: SwitchHandler) => {
	switch (req.method) {
		case "GET":
			if (handler.GET) await handler.GET(req, res)
			else res.status(405).end(`${req.method} Not Allowed`)
			break

		case "POST":
			if (handler.POST) await handler.POST(req, res)
			else res.status(405).end(`${req.method} Not Allowed`)
			break
		
		case "PUT":
			if (handler.PUT) await handler.PUT(req, res)
			else res.status(405).end(`${req.method} Not Allowed`)
			break

		case "PATCH":
			if (handler.PATCH) await handler.PATCH(req, res)
			else res.status(405).end(`${req.method} Not Allowed`)
			break

		default:
			res.status(405).end(`${req.method} Not Allowed`)
			break
	}
}

export type MetaPage = {
	totalItem: number
	lastPage: number
	currentPage: number
	perPage: number
	prev: number | null
	next: number | null
}

export type PaginatedResult<T> = {
	items: T[]
	meta: {
		totalItem: number
		lastPage: number
		currentPage: number
		perPage: number
		prev: number | null
		next: number | null
	}
}

import { NextMiddleware, NextResponse } from "next/server"
import type { MiddlewareFactory } from "./middlewares/types"
// export const config = { matcher: ["/admin/:path*"] }

import { withAuthorization } from "./middlewares/withAuth"

const middlewares: MiddlewareFactory[] = [withAuthorization]
export default stackMiddlewares(middlewares)

// https://reacthustle.com/blog/how-to-chain-multiple-middleware-functions-in-nextjs

// type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware
function stackMiddlewares(functions: MiddlewareFactory[] = [], index = 0): NextMiddleware {
	const current = functions[index]
	if (current) {
		const next = stackMiddlewares(functions, index + 1)
		return current(next)
	}
	return () => NextResponse.next()
}

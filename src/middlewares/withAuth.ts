import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { MiddlewareFactory } from "./types"
import { getToken } from "next-auth/jwt"

const requireAuth = ["/admin"]
export const withAuthorization: MiddlewareFactory = (next) => {
	return async (request: NextRequest, _next: NextFetchEvent) => {
		const pathname = request.nextUrl.pathname
		const token = await getToken({ req: request })
		// const res = await next(request, _next)
		if (requireAuth.some((path) => pathname.startsWith(path))) {
			// const token = await getToken({ req: request })
			// console.log(token)
			if (!token) {
				// not logged in
				return NextResponse.redirect(new URL("/api/auth/signin", request.url))
			}
			// res?.headers.set('x-role', token.role)
			if (token.role === "USER") {
				// no permission
				// NextResponse.
				return NextResponse.redirect(new URL("/403", request.url))

				// return next(url)
				// _next.
			}
		}
		// console.log("Log some data here", request.nextUrl.pathname)
		//
		//
		// Disable role admin use front office
		// can use only back office only
		// console.log('req', pathname)
		if (token?.role === 'ROOT' && pathname.startsWith("/profile/activity"))
			return NextResponse.redirect(new URL('/admin', request.url))
		
		// return res
		return next(request, _next)
	}
}

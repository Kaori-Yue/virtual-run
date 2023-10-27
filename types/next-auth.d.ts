import NextAuth, { DefaultUser, DefaultSession, DefaultJWT } from "next-auth"
import type { Role } from "@prisma/client"
import type { db } from "@/db"

declare module "next-auth" {
	interface User extends DefaultUser {
		role: Role = "USER"
	}
	interface Session extends DefaultSession {
		role: Role
		user: {
			id: string
			name: string | null
			email: string
			image: string | null
		} 
	}
	// interface JWT extends DefaultJWT {
	// 	role: string
	// }
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends DefaultJWT {
		role: Role
		sub: string
	}
}

//   https://next-auth.js.org/getting-started/typescript


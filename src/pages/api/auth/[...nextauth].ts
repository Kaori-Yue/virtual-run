import NextAuth, { NextAuthOptions, AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/db"
import { Adapter } from "next-auth/adapters"

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const x = PrismaAdapter(db)
export const authOptions: NextAuthOptions = {
	// Configure one or more authentication providers

	adapter: PrismaAdapter(db) as Adapter,

	session: {
		strategy: "jwt",
		// strategy: "database",
		// maxAge: 30 * 24 * 60 * 60, // 30 Days
		// updateAge: 24 * 60 * 60, // 1 Day
	},
	// cookies: {
	// 	sessionToken: {options:{}}
	// },

	callbacks: {
		jwt({ token, user, account, profile, trigger }) {
			// console.log('jwt trigger: ' + trigger)
			// console.log("jwt token")
			// console.log(token)
			// console.log('jwt user')
			// console.log(user)
			// console.log(account)
			// console.log(profile)
			if (user) token.role = user.role
			return token
		},

		session({ session, token, user }) {
			// console.log("s")
			// console.log(session)
			// console.log(token)
			// console.log(user)
			// session.ro = 'q'
			session.role = token.role
			session.user && (session.user.id = token.sub!)
			return session
		},

		async redirect({ url, baseUrl }) {
			// Allows relative callback URLs
			if (url.startsWith("/")) return `${baseUrl}${url}`
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url
			return baseUrl
		},
	},

	providers: [
		CredentialsProvider({
			// type: 'credentials',
			// The name to display on the sign in form (e.g. "Sign in with...")
			// id: "local",
			name: "Local auth",
			// `credentials` is used to generate a form on the sign in page.
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			// You can pass any HTML attribute to the <input> tag through the object.
			credentials: {
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" },
			},

			async authorize(credentials, req) {
				// Add logic here to look up the user from the credentials supplied
				// const user = await db.user.findFirst({
				// 	where: {
				// 		username: credentials?.username,
				// 		// password: '',
				// 	}
				// })
				if (credentials === undefined) return null
				const user = await db.user.findFirst({
					where: {
						email: credentials.username,
						// password: credentials.password
					},
				})

				// const user = { id: "12", name: "qJw Smith", email: "jsmith@example.com", role: 'root' }
				console.log('user,', user)
				if (user) {
					// user.role
					// Any object returned will be saved in `user` property of the JWT
					// const y = { ...user, id: String(user.id), role: 'root' }
					// console.log(y)
					// console.log(y)
					// return { ...user, role: 'rr'}
					return user
				} else {
					// If you return null then an error will be displayed advising the user to check their details.
					return null

					// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
				}
			},
		}),

		// ...add more providers here
	],
	pages: {
		signIn: "/signin",
	},
}
export default NextAuth(authOptions)

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
		strategy: "jwt", // MUST explicitly
		// strategy: "database",
		// maxAge: 30 * 24 * 60 * 60, // 30 Days
		// updateAge: 24 * 60 * 60, // 1 Day
	},
	// cookies: {
	// 	sessionToken: {options:{}}
	// },

	// flow => signin -> callbacks.jwt -> callbacks.session
	callbacks: {
		async jwt({ token, user, account, profile, trigger, session }) {
			// console.log("jwt trigger: " + trigger)
			// console.log("jwt token")
			// console.log(token)
			// console.log("jwt user")
			// console.log(user)
			// // console.log(account)
			// console.log("jwt profile")
			// console.log(profile)
			// console.log("jwt session")
			// console.log(session)
			if (trigger === "update") {
				const newName = session?.name || undefined
				const newImage = session?.image || undefined
				console.log("tigger update data:", newName, newImage)
				const update = await db.user.update({
					where: { id: token.sub },
					data: {
						name: newName,
						image: newImage,
					},
				})
				token.name = update.name
				token.picture = update.image
			}
			if (user) {
				token.test = "TESTQ"
				token.role = user.role
				// token.picture = 'https://cdn.discordapp.com/attachments/1124220420283957341/1146414285631803403/85190610_p0.jpg'
			}
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
				username: { label: "Username", type: "text", placeholder: "email" },
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
				// TODO: on prod -> auth
				const user = await db.user.findFirst({
					where: {
						email: credentials.username,
						// password: credentials.password
					},
				})

				// const user = { id: "12", name: "qJw Smith", email: "jsmith@example.com", role: 'root' }
				console.log("user,", user)
				if (user) {
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

// const authHandler = NextAuth(authOptions);
// export default async function handler(...params: any[]) {
//   await authHandler(...params);
// }

export default NextAuth(authOptions)

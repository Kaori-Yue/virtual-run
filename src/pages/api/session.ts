// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "./auth/[...nextauth]"
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth/next"

type Data = {
	// name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	// const token = await getToken({ req })
	const session = await getServerSession(req, res, authOptions)
	if (session) {
		// Signed in
		// console.log("API: Session", JSON.stringify(session, null, 2))
		res.status(200).json(session)
	} else {
		// Not Signed in
		res.status(401)
	}
	res.end()
}

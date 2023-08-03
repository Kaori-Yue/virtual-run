// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

type Data = {
	// name: string

}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const token = await getToken({ req })
	if (token) {
		// Signed in
		// console.log("API: JSON Web Token", JSON.stringify(token, null, 2))
		res.status(200).json(token)
	} else {
		// Not Signed in
		res.status(401)
	}
	res.end()
}

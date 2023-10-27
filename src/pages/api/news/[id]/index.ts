import { db, News } from "@/db"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"
import timers from 'timers/promises'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: get,
	})
}

//


async function get(req: NextApiRequest, res: NextApiResponse<News>) {
	const id = req.query.id
	if (typeof id !== "string") {
		return res.status(404).end()
	}
	if (!Number.isInteger(+id)) {
		return res.status(404).end()
	}

	// await timers.setTimeout(2000)
	const news = await getNewsById(+id)
	if (news === null) return res.status(404).end()
	return res.json(news)
}


export async function getNewsById(id: number) {
	const news = await db.news.findUnique({
		where: {
			id: id,
			active: true
		},
	})
	return news
}

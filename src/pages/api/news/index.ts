import { db, News } from "@/db"
import { MetaPage, apiSwitchHandler } from "@/utils/api"
import { NextApiRequest, NextApiResponse } from "next/types"
import { faker } from "@faker-js/faker"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await apiSwitchHandler(req, res, {
		GET: getNews,
	})
}

//

export type NewsList = {
	items: News[]
	meta: MetaPage
}
async function getNews(req: NextApiRequest, res: NextApiResponse<NewsList>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const [data, total] = await Promise.all([
		db.news.findMany({
			take: limit,
			skip: page > 0 ? limit * (page - 1) : 0,
		}),
		db.news.count(),
	])
	const lastPage = Math.ceil(total / limit)
	res.status(200).json({
		items: data,
		meta: {
			totalItem: total,
			lastPage,
			currentPage: page,
			perPage: limit,
			prev: page > 1 ? page - 1 : null,
			next: page < lastPage ? page + 1 : null,
		},
	})
}

async function getNewsMockup(req: NextApiRequest, res: NextApiResponse<NewsList>) {
	const limit = Number(req.query.limit) || 10
	const page = Number(req.query.page) || 1
	const news: News[] = []
	for (let index = 0; index < 50; index++) {
		news.push({
			active: true,
			content: "mock",
			id: 0,
			title: "mock",
			userId: "",
			updated_at: new Date(),
			created_at: new Date(),
			thumbnail: faker.image.urlPicsumPhotos(),
		})
	}
	//
	const lastPage = Math.ceil(news.length / limit)
	res.status(200).json({
		items: news.slice(0, limit),
		meta: {
			totalItem: news.length,
			lastPage,
			currentPage: page,
			perPage: limit,
			prev: page > 1 ? page - 1 : null,
			next: page < lastPage ? page + 1 : null,
		},
	})
}

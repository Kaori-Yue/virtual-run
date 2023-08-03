
import type { ComponentType, ReactElement } from 'react'
import Layout from '../components/layout/frontOffice'
import Header from '@/components/header'
import NestedLayout from '../components/layout/frontOffice/index'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from './_app'
import { GetStaticProps, InferGetStaticPropsType } from 'next/types'
import { db } from '@/db' 
import {News, Event} from 'prisma/prisma-client'
import dayjs from 'dayjs'
import locale_th  from 'dayjs/locale/th'
import buddhistEra  from 'dayjs/plugin/buddhistEra'
// dayjs.locale('th')
dayjs.extend(buddhistEra)
dayjs.locale(locale_th)

// const Page: NextPageWithLayout = () => {
//   return <p>hello world</p>
// }

// type Props = {
// 	items: {
// 		imageURL: string
// 		title: string
// 		subTitle: string
// 		url: string
// 	}[]
// }

type Props = {
	news: News[]
	events: Event[]
}



export const getStaticProps: GetStaticProps<{props: Props}> = async ({ params }) => {
	// const id = params?.id
	// const news = await db.news.findMany()

	const [news, events] = await Promise.all([
		db.news.findMany(),
		db.event.findMany()
	])
	// const data:Props['items'] = [...Array(10).keys()].map(i => ({
	// 	imageURL: faker.image.urlPicsumPhotos(),
	// 	title: faker.lorem.sentence().trim(),
	// 	subTitle: faker.lorem.paragraph().trim(),
	// 	url: '/news/' + i
	// }))
	while(news.length < 3) {
		news.push({
			active: true,
			content: 'mock',
			id: 0,
			title: 'mock',
			userId: '',
			updated_at: new Date(),
			created_at: new Date(),
			thumbnail: faker.image.urlPicsumPhotos(),
		})
	}
	return JSON.parse(JSON.stringify({
		props: {
			news,
			events
		}
	}))
}


const Page:NextPageWithLayout<Props> = (props) => {
	// const f = faker.image.urlPlaceholder
	// console.log('p')
	// console.log(props)
	return (
		<div className='container mx-auto'>
			<br />
			{/*  */}
			News:
			<div className='flex flex-wrap gap-2 justify-center'>
				{
					props.news.map((v, i) => {
						return <Card key={i} url={`/news/${v.id}`} imageURL={v.thumbnail} subTitle={'sub title'} title={v.title}></Card>
					})
				}
				{/* {
					[...Array(10)].map((x, i) =>
						<Card key={i}
							url={'/news/' + i } 
							imageURL={faker.image.urlPicsumPhotos()}
							title={faker.lorem.sentence().trim()}
							subTitle={faker.lorem.paragraph().trim()} />
					)
				} */}
			</div>
			{/*  */}


			Event:
			<div className='flex flex-wrap gap-2 justify-center'>
				{
					props.events.map((v, i) => {
						const subTitle = dayjs(v.register_startdate).format('DD MMM BB') + ' - ' + dayjs(v.register_enddate).format('DD MMM BB')
						return <Card key={i} url={`/event/${v.id}`} imageURL={v.thumbnail} subTitle={subTitle} title={v.title}></Card>
					})
				}
				{/* {
					[...Array(10)].map((x, i) =>
						<Card key={i}
							url={'/news/' + i } 
							imageURL={faker.image.urlPicsumPhotos()}
							title={faker.lorem.sentence().trim()}
							subTitle={faker.lorem.paragraph().trim()} />
					)
				} */}
			</div>
		</div>
	)
}

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

export default Page

// avoid hydration, because use faker to ramdom, server-side and client-side not match
// export default dynamic(() => Promise.resolve(Page), { ssr: false })

// const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
// ssr.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }
// export default ssr
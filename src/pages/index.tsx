
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
import { News, Event } from 'prisma/prisma-client'
import dayjs from 'dayjs'
import locale_th from 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import useSWR, { Fetcher } from 'swr'
import { EventList } from './api/event'
import { NewsList } from './api/news'
import { fetcher, fetcher_multiple, formatDateTime } from '@/utils'
import Loading from '@/components/Loading'
// dayjs.locale('th')
dayjs.extend(buddhistEra)
dayjs.locale(locale_th)

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



const Page: NextPageWithLayout<Props> = () => {
	// const f = faker.image.urlPlaceholder
	// console.log('p')
	// console.log(props)
	// const { data, error, isLoading } = useSWR<GET>('/api/event', fetcher)
	// const { data, error, isLoading } = useSWR<[EventList, NewsList]>(['/api/event', '/api/news'], fetcher_multiple, {
	// 	revalidateOnFocus: false
	// })

	const { data: event, isLoading: evnet_loading } = useSWR<EventList>('/api/event?limit=8')
	const { data: news, isLoading: news_loading } = useSWR<NewsList>('/api/news?limit=8')

	// console.log({
	// 	data, error, isLoading
	// })
	if (evnet_loading || news_loading || !event || !news) return <Loading className='mt-4' />
	// if (error || data === undefined) return <span>Error.. { JSON.stringify(error) }</span>
	// return <pre>{ JSON.stringify(data, null, 4) }</pre>
	return (
		<div className='container mx-auto my-4'>
			<div className='flex flex-wrap gap-3 justify-center'>
				<span className='basis-1/4 md:basis-2/5 lg:basis-10/12 xl:basis-8/12 2xl:basis-5/12'>ข่าวสาร</span>
				<Link href={ `/news` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline basis-1/4 md:basis-2/5 lg:basis-1/12 xl:basis-1/12 2xl:basis-5/12 text-right">
					ทั้งหมด
				</Link>
				{/* <span className='basis-1/4 md:basis-2/5 lg:basis-1/12 xl:basis-1/12 2xl:basis-5/12 text-right'>ทั้งหมด</span> */ }
				{
					news.items.map((v, i) => {
						return <Card key={ i } url={ `/news/${v.id}` } imageURL={ v.thumbnail } subTitle={ dayjs(v.updated_at).format('DD MMM BB') } title={ v.title }></Card>
					})
				}
				{/* {
					props.news.map((v, i) => {
						return <Card key={ i } url={ `/news/${v.id}` } imageURL={ v.thumbnail } subTitle={ 'sub title' } title={ v.title }></Card>
					})
				} */}

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
			{/*  */ }


			<div className='flex flex-col mt-8'>
				{/* <div className='flex justify-between mb-2'>
					<span>กิจกรรม</span>
					<span>ทั้งหมด</span>
				</div> */}
				<div className='flex flex-wrap gap-3 justify-center'>
					<span className='basis-1/4 md:basis-2/5 lg:basis-10/12 xl:basis-8/12 2xl:basis-5/12'>กิจกรรม</span>
					<Link href={ `/event` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline basis-1/4 md:basis-2/5 lg:basis-1/12 xl:basis-1/12 2xl:basis-5/12 text-right">
						ทั้งหมด
					</Link>
					{/* <span className='basis-1/4 md:basis-2/5 lg:basis-1/12 xl:basis-1/12 2xl:basis-5/12 text-right'>ทั้งหมด</span> */ }
					{
						event.items.map((v, i) => {
							const subTitle = dayjs(v.register_startdate).format('DD MMM BB') + ' - ' + dayjs(v.register_enddate).format('DD MMM BB')
							return <Card key={ i } url={ `/event/${v.id}` } imageURL={ v.thumbnail } subTitle={ subTitle } title={ v.title }></Card>
						})
					}
					{/* {
					props.events.map((v, i) => {
						const subTitle = dayjs(v.register_startdate).format('DD MMM BB') + ' - ' + dayjs(v.register_enddate).format('DD MMM BB')
						return <Card key={ i } url={ `/event/${v.id}` } imageURL={ v.thumbnail } subTitle={ subTitle } title={ v.title }></Card>
					})
				} */}
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
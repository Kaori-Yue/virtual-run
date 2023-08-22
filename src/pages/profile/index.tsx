
import { useEffect, type ComponentType, type ReactElement, useState, useMemo } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker, ro } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps, InferGetServerSidePropsType } from 'next/types'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { handlerStatusPage, isErrorPage, ErrorPageProps, getLayout } from '@/utils/errorPage'
import { db, User, Prisma } from '@/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import { durationToPace, excludeKeys, fetcher, formatDateTime } from '@/utils'
import HistoryAttendance from '@/components/historyAttendance'
import FlashMessage from '@/components/flashMessage'
import useSWR, { preload } from 'swr'
import type { ActivityList } from '@/pages/api/users/activity'
import ReusableTable, { CompactType } from '@/components/ReusableTable'
import Loading from '@/components/Loading'
import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
import Paginate from '@/components/ReusableTable/Paginate'
dayjs.extend(_duration)

const Profile: NextPageWithLayout = () => {
	// const props = ctx as Props

	// const { data, error, isLoading } = useSWR<ActivityList>(`/api/users/activity?limit=10&page=${router.query.page ?? 1}`, fetcher, {
	// 	revalidateOnFocus: false
	// })
	// if (isLoading || !data) return <span>Loading</span>

	return (
		<div className='container mx-auto'>
			<Head>
				<title>My Profile</title>
			</Head>
			<br />
			<div className="flex justify-end">
				<Link href={ '/profile/activity/add' }>
					<button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
						Add Activity
					</button>
				</Link>
			</div>

			{/* <pre>
				{JSON.stringify(data, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */ }


			<Table />
			

		</div>
	)
}

const Table = () => {
	const router = useRouter()
	// useEffect(() => {
	// 	if (router.isReady === false)
	// 		return
	// }, [router.isReady])
	// router.isReady work only with in useEffect // client side
	// const [page, setPage] = useState('')
	// 	useEffect(() => {
	// 	if (router.isReady === false)
	// 		return
	// 	setPage(router.query.page as string ?? '1')
	// }, [router.query.page])

	// const { data, isLoading, error } = useSWR<ActivityList>(page ? `/api/users/activity?limit=5&page=${page}` : null)

	const { data, isLoading, error } = useSWR<ActivityList>(`/api/users/activity?limit=5&page=${router.query.page ?? 1}`)
	const t: CompactType = {
		headers: ['#', 'Distance', 'Duration', 'Pace', 'Create At', 'Screenshot', 'Action'],
		contents: [],
		isLoading
	}
	// if (isLoading || !data) return <Loading />
	if (isLoading || !data) return <ReusableTable { ...t } />
	if (data.meta.totalItem === 0) return <span className='block text-center'>No Data</span>
	// return <ReusableTable { ...t } />
	t.preload = data.meta.next ? `/api/users/activity?limit=5&page=${data.meta.next}` : undefined
	// if (data.meta.next) {
	// 	preload(`/api/users/activity?limit=5&page=${data.meta.next}`, fetcher)
	// }
	for (const [i, item] of data.items.entries()) {
		t.contents.push([
			((data.meta.currentPage - 1) * data.meta.perPage) + i + 1,
			{
				data: item.distance / 1000,
				// className: 'text-blue-600'
			},
			dayjs.duration(item.duration, 'seconds').format('HH:mm:ss'),
			durationToPace(item.duration, item.distance / 1000),
			dayjs(item.created_at).format(formatDateTime),
			<Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href={ item.screenshot }>Image</Link>,
			{
				className: 'px-6 py-4 flex gap-x-2 text-red-500',
				data: <>
					<span>text</span>
					<Link href={ `/activity/${item.id}/view` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
					<Link href={ `/activity/${item.id}/attach` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Attach</Link>
				</>
			}
		])


		// t.contents.push({
		// 	row: [
		// 					i + 1,
		// 	item.distance / 1000,
		// 	dayjs.duration(item.duration, 'seconds').format('HH:mm:ss'),
		// 	durationToPace(item.duration, item.duration / 1000),
		// 	dayjs(item.created_at).format(formatDateTime),
		// 	<Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href={ item.screenshot }>Image</Link>,
		// 	// {}
		// 	],
		// 	className: 'dark:bg-red-100'
		// })
	}

	return <ReusableTable { ...t } paginate={ Paginate(data.meta) } />
	// return <>
	// <HistoryAttendance data={ data } />
	// <ReusableTable { ...t } />
	// </>
}


export default Profile

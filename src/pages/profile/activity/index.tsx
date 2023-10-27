
import { useEffect, type ComponentType, type ReactElement, useState, useMemo } from 'react'

import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'

import Head from 'next/head'
import { durationToPace, excludeKeys, fetcher, formatDateTime } from '@/utils'
import useSWR, { preload } from 'swr'
import type { ActivityList } from '@/pages/api/users/activity'
import ReusableTable, { CompactType } from '@/components/ReusableTable'

import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
import Paginate from '@/components/ReusableTable/Paginate'
import { useSession } from 'next-auth/react'
import { TotalDistance } from '@/pages/api/users/activity/distance'
import { SortDown } from '@/components/util/table'
dayjs.extend(_duration)

const Profile: NextPageWithLayout = () => {
	// const props = ctx as Props

	// const { data, error, isLoading } = useSWR<ActivityList>(`/api/users/activity?limit=10&page=${router.query.page ?? 1}`, fetcher, {
	// 	revalidateOnFocus: false
	// })
	// if (isLoading || !data) return <span>Loading</span>

	const { data, error, isLoading } = useSWR<TotalDistance>(`/api/users/activity/distance`)
	// if (isLoading) return <Loading />
	return (
		<div className='container mx-auto mt-4'>
			<Head>
				<title>My Activity</title>
			</Head>


			{/* <pre>
				{JSON.stringify(data, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */ }
			{/* <Link href={ '/profile/activity/add' }>
				<button type="button" className="block  clear-both justify-items-end mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-0 ml-auto mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
					เพิ่มรายการวิ่ง
				</button>
			</Link> */}
			<Link href={ '/profile/activity/add' } role='button' className='block float-right mr-0 ml-auto mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"'>
				เพิ่มรายการวิ่ง
			</Link>
			<br className='clear-both'/>
			<Table />




		</div>
	)
}

const Table = () => {
	const router = useRouter()
	const { status } = useSession()
	useEffect(() => {
		if (status === 'unauthenticated')
			router.push('/')

		return () => {

		}
	}, [status])
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

	const { data, isLoading, error } = useSWR<ActivityList>(`/api/users/activity?limit=10&page=${router.query.page ?? 1}`)
	const t: CompactType = {
		headers: ['#', 'ระยะทาง', 'ระยะเวลา', 'เพซ', <SortDown text='เวลาสร้าง'/>, 'เวลาทำกิจกรรม', 'เวลาแก้ไขล่าสุด', 'Screenshot', 'Action'],
		contents: [],
		isLoading,
	}
	// if (isLoading || !data) return <Loading />
	if (isLoading || !data) return <ReusableTable { ...t } />
	if (data.meta.totalItem === 0) return <span className='block text-center'>No Data</span>
	// return <ReusableTable { ...t } />
	t.preload = data.meta.next ? `/api/users/activity?limit=10&page=${data.meta.next}` : undefined
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
			dayjs(item.assigned_at).format(formatDateTime),
			dayjs(item.updated_at).format(formatDateTime),
			<Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href={ item.screenshot }>Image</Link>,
			{
				className: 'px-6 py-4 flex gap-x-2 text-red-500',
				data: <>

					<Link href={ `/activity/${item.id}/view` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">รายละเอียดการวิ่ง</Link>
					<Link href={ `/activity/${item.id}/attach` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">ส่งผล</Link>
					<Link href={ `/activity/${item.id}/edit` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">แก้ไข</Link>
				</>
			}
		])
	}

	return <ReusableTable { ...t } paginate={ Paginate(data.meta) } />
	// return <>
	// <HistoryAttendance data={ data } />
	// <ReusableTable { ...t } />
	// </>
}


export default Profile

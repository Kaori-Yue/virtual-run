// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement } from "react"
import Header from '@/components/layout/backOffice'
import { db } from '@/db'
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Event } from '@prisma/client'
import dayjs from 'dayjs'
import { useRouter } from "next/router"
import { formatDateTime } from "@/utils"
import useSWR from "swr"
import { EventListByUser } from "@/pages/api/users/event"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import { useSession } from "next-auth/react"
import Paginate from "@/components/ReusableTable/Paginate"



const Page: NextPageWithLayout = () => {
	// const router = useRouter()

	return (
		<div className="container mx-auto mt-2">
			<pre>
				{/* { JSON.stringify(props, null, 2) } */ }
			</pre>
			<div className="flex justify-end">
				<Link href={ '/admin/event/create' }>
					<button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
						สร้างกิจกรรม
					</button>
				</Link>
			</div>
			<Table />
		</div>
	)


}

const Table = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const { data, isLoading } = useSWR<EventListByUser>(`/api/users/event?limit=5&page=${router.query.page ?? 1}`)
	const props: CompactType = {
		headers: [
			'ชื่อกิจกรรม',
			session?.role === 'ROOT' ? 'User' : undefined,
			'วันที่สร้าง',
			'เวลาเริ่มกิจกรรม',
			'เวลาสิ้นสุดกิจกรรม',
			'Action',
		],
		contents: [],
		isLoading: isLoading,
	}
	if (isLoading || !data) return <ReusableTable { ...props } />
	for (const [i, item] of data.items.entries()) {
		props.contents.push([
			<Link href={ `/event/${item.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ item.title }</Link>,
			session?.role === 'ROOT' ? item.userId : undefined,
			dayjs(item.created_at).format(formatDateTime),
			dayjs(item.register_startdate).format(formatDateTime),
			dayjs(item.register_enddate).format(formatDateTime),
			{
				className: 'px-6 py-3 flex gap-x-2',
				data: <>
					<Link href={ `/event/${item.id}/scoreboard` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">อันดับ</Link>
					<Link href={ `/admin/event/${item.id}/log` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">ประวัติ</Link>
					<Link href={ `/admin/event/${item.id}/edit` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">แก้ไข</Link>
				</>
			}
		])
	}
	return <ReusableTable { ...props } paginate={ Paginate(data.meta) } />
}



Page.defaultLayout = 'BACK_OFFICE'

export default Page
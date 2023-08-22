import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import type { Activity, Prisma } from '@/db'
import React from "react"
import { durationToPace } from '@/utils'
import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
import type { ActivityList } from "@/pages/api/users/activity"
dayjs.extend(_duration)
type Props = {
	data: ActivityList
	// data: Prisma.Event_LogsGetPayload<{ include: { event: { select: { title: true } } } }>[]
}

const TableContent = ({ list }: { list: Props['data']['items'] }) => {
	const content: React.JSX.Element[] = []
	for (const [key, item] of list.entries()) {
		content.push(
			<tr key={ key } className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
				<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
					{/* {value.title} */ }
					{ key + 1 }
				</th>
				<td className="px-6 py-4">
					{ item.distance / 1000 }
				</td>
				<td className="px-6 py-4">
					{ dayjs.duration(item.duration, 'seconds').format('HH:mm:ss') }
				</td>
				<td className="px-6 py-4">
					{ durationToPace(item.duration, item.distance / 1000) }
				</td>
				<td className="px-6 py-4">
					{/* {item.created_at.toLocaleString()} */ }
					{ dayjs(item.created_at).format('DD/MM/YY HH:mm:ss') }
				</td>
				<td className="px-6 py-4">
					<Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" href={ item.screenshot }>Image</Link>
				</td>
				<td className="px-6 py-4 flex gap-x-2">
					<Link href={ `/activity/${item.id}/view` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
					<Link href={ `/activity/${item.id}/attach` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Attach</Link>
				</td>
			</tr>
		)
	}
	return content
}

const TableSkeletonContent = () => {
	const content: React.JSX.Element[] = []
	for (let index = 0; index < 5; index++) {
		content.push(
			<tr className="animate-pulse bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
				</td>
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className="px-6 py-5">
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className="px-6 py-5">
					<div className="flex items-center space-x-2">
						<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-12"></div>
						<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-12"></div>
					</div>
				</td>
			</tr>
		)
	}
	return content
}

const HistoryAttendance = (props: Props) => {

	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							#
						</th>
						<th title="Km" scope="col" className="px-6 py-3">
							Distance
						</th>
						<th scope="col" className="px-6 py-3">
							Duration
						</th>
						<th scope="col" className="px-6 py-3">
							Pace
						</th>
						<th scope="col" className="px-6 py-3">
							Create At
						</th>
						<th scope="col" className="px-6 py-3">
							Screenshot
						</th>
						<th scope="col" className="px-6 py-3">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{/* <TableContent list={props.data} /> */ }
					{/* <TableSkeletonContent /> */ }
					{
						props.data
							? <TableContent list={ props.data.items } />
							: <TableSkeletonContent />
					}
				</tbody>
			</table>
			<nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
				<span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">
					{ props.data.meta.prev === null
						? '1'
						: (props.data.meta.currentPage * props.data.meta.perPage) - 1 }
					-
					{ props.data.meta.next === null
						? props.data.meta.totalItem
						: (props.data.meta.currentPage * props.data.meta.perPage) } </span>
					of
					<span className="font-semibold text-gray-900 dark:text-white"> { props.data.meta.totalItem } </span>
				</span>
				<ul className="inline-flex -space-x-px text-sm h-8">
					<li>

						<Link href={ {
							query: {
								page: props.data.meta.prev ?? props.data.meta.currentPage
							}
						} } className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Previous
						</Link>
					</li>
					<li>
						<a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
					</li>
					<li>
						<a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
					</li>
					<li>
						<a href="#" aria-current="page" className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
					</li>
					<li>
						<a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
					</li>
					<li>
						<a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
					</li>
					<li>
						<Link href={ {
							query: {
								page: props.data.meta.next ?? props.data.meta.currentPage
							}
						} } className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Next
						</Link>
					</li>
				</ul>
			</nav>
		</div>
	)
}

export default HistoryAttendance
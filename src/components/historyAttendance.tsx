import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import type { Event_Logs, Prisma } from '@/db'
import React from "react"
import { durationToPace } from '@/utils'
import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
dayjs.extend(_duration)
type Props = {
	data: Prisma.Event_LogsGetPayload<{ include: { event: { select: { title: true } } } }>[]
}

const TableContent = ({ list }: { list: Props['data'] }) => {
	const content: React.JSX.Element[] = []
	for (const [key, item] of list.entries()) {
		content.push(
			<tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
				<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
					{/* {value.title} */}
					{key + 1}
				</th>
				<td className="px-6 py-4">
					{item.event.title}
				</td>
				<td className="px-6 py-4">
					{item.distance / 1000}
				</td>
				<td className="px-6 py-4">
					{ dayjs.duration(item.duraion, 'seconds').format('HH:mm:ss') }
				</td>
				<td className="px-6 py-4">
					{durationToPace(item.duraion, item.distance / 1000)}
				</td>
				<td className="px-6 py-4">
					{/* {item.created_at.toLocaleString()} */}
					{ dayjs(item.created_at).format('DD/MM/YY HH:mm:ss') }
				</td>
				<td className="px-6 py-4 flex gap-x-2">
					<Link href={`/attendance/${item.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
				</td>
			</tr>
		)
	}
	return content
}

const HistoryAttendance: NextPageWithLayout<Props> = (props) => {

	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							#
						</th>
						<th scope="col" className="px-6 py-3">
							ชื่อกิจกรรม
						</th>
						<th title="กิโลเมตร" scope="col" className="px-6 py-3">
							ระยะทาง
						</th>
						<th scope="col" className="px-6 py-3">
							ระยะเวลา
						</th>
						<th scope="col" className="px-6 py-3">
							เพซ
						</th>
						<th scope="col" className="px-6 py-3">
							ส่งผล
						</th>
						<th scope="col" className="px-6 py-3">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					<TableContent list={props.data} />
				</tbody>
			</table>
			<nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
				<span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">1-10</span> of <span className="font-semibold text-gray-900 dark:text-white">1000</span></span>
				<ul className="inline-flex -space-x-px text-sm h-8">
					<li>
						<a href="#" className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
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
						<a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
					</li>
				</ul>
			</nav>
		</div>
	)
}

export default HistoryAttendance
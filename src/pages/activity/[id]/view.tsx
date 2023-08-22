import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { db, Prisma, Activity } from '@/db'
import useSWR from "swr"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import _duration from 'dayjs/plugin/duration'
dayjs.extend(_duration)
import { durationToPace, formatDateTime } from '@/utils/index'

type Props = {
	activity: Activity
}

const Page: NextPageWithLayout = (props) => {
	// console.log(props)
	const router = useRouter()
	const { data, isLoading } = useSWR<Activity>(`/api/users/activity/` + router.query.id)
	if (isLoading || !data) return <span>Loading..</span>
	return (
		<div className="container mx-auto">
			<pre>
				{ JSON.stringify(data, null, 4) }
			</pre>
			<p className="text-center my-2">Activity Detail</p>
			{/* { <p className="text-center">#{data} - {props.event.title}</p> } */ }
			<Table item={ data } />
			<div className="pt-4 text-center">
				Screenshot
				<img className="pt-1 mx-auto" src={ data.screenshot }></img>
			</div>

		</div>
	)

}

const Table = ({ item }: { item: Activity }) => {
	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							Distance
						</th>
						<th title="Kilometers" scope="col" className="px-6 py-3">
							Total Distance
						</th>
						<th scope="col" className="px-6 py-3">
							Attendance
						</th>
						<th scope="col" className="px-6 py-3">
							Create at
						</th>
						<th scope="col" className="px-6 py-3">
							Assign at
						</th>
					</tr>
				</thead>
				<tbody>
					{
						<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<td className="px-6 py-4">
								{ item.distance / 1000 }
							</td>
							<td className="px-6 py-4">
								{ dayjs.duration(item.duration, 'seconds').format("HH:mm:ss") }
							</td>
							<td className="px-6 py-4">
								{ durationToPace(item.duration, item.distance / 1000) }
							</td>
							<td className="px-6 py-4">
								{ dayjs(item.created_at).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								{ dayjs(item.assigned_at).format(formatDateTime) }
							</td>
						</tr>
					}
				</tbody>
			</table>
		</div>

	)
}


export default Page
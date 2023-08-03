import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types"
import { db, Prisma, Event } from '@/db'
import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
import superjson from 'superjson';
import { formatDateTime } from "@/utils"

dayjs.extend(_duration)
type Props = {
	// event: Prisma.EventGetPayload<{ include: { Event_Logs: true } }>
	event: Prisma.EventGetPayload<{ include: { Event_Logs: { include: { user: true } } } }>
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const { params } = ctx
	if (!(params && params.id)) return { notFound: true }
	if (!Number.isInteger(+params.id)) return { notFound: true }
	const id = +params.id
	// const query = await db.event_Logs.groupBy({
	// 	by: ['userId'],
	// 	_sum: {
	// 		distance: true
	// 	},
	// 	where: {
	// 		eventId: id,
	// 	}
	// })
	// const q = "SELECT SUM(`project`.`Event_Logs`.`distance`) as sum,`project`.`Event_Logs`.`userId`, `project`.`User`.`name` FROM `project`.`Event_Logs` WHERE `project`.`Event_Logs`.`eventId` = 1 GROUP BY `project`.`Event_Logs`.`userId`"
	// const query = await db.$queryRaw`SELECT SUM(project.Event_Logs.distance) as distance_sum, CAST(COUNT(*) as INT) as attendance, project.Event_Logs.userId, project.User.name FROM project.Event_Logs LEFT JOIN User ON project.Event_Logs.userId = project.User.id WHERE project.Event_Logs.eventId = ${id} GROUP BY project.Event_Logs.userId`
	const event = await db.event.findUnique({
		where: { id },
		include: {
			Event_Logs: {
				include: {
					user: true
				}
			}
		}
	})
	if (!event) return { notFound: true }
	// const query = await db.$queryRaw`SELECT * FROM project.Event_Logs`
	// const query = await db.event_Logs.findMany({
	// 	where: { eventId: id},

	// })
	// if (!query) return { notFound: true }

	return {
		props: {
			// score,
			event,
		}
	}

	// return JSON.parse(JSON.stringify({
	// 	props: {
	// 		score: query
	// 	}
	// }))
}

const Page: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
	// console.log(props)
	return (
		<span className="container mx-auto">
			<>
				{
					//  JSON.stringify(JSON.parse(superjson.stringify(props)), null, 4)
					// JSON.stringify(props, null, 4)
				}
			</>
			<p className="text-center my-2">Logs: {props.event.title}</p>
			<p className="text-center my-2">Total attendance: {props.event.Event_Logs.length}</p>
			{/* <p className="text-center">#{props.event.id} - {props.event.title}</p> */}
			<Table items={props.event.Event_Logs} />
		</span>
	)

}

const Table = (props: { items: Props['event']['Event_Logs'] }) => {

	const content = () => {
		const content: JSX.Element[] = []
		for (const [key, value] of props.items.entries()) {
			content.push(
				<tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
					<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
						{/* {value.title} */}
						{key + 1}
					</th>
					<td className="px-6 py-4">
						{value?.user?.name ?? value.user.email}
					</td>
					<td className="px-6 py-4">
						{value.distance / 1000}
					</td>
					<td className="px-6 py-4">
						{dayjs.duration(value.duraion, 'seconds').format('HH:mm:ss')}
					</td>
					<td className="px-6 py-4">
						{dayjs(value.created_at).format(formatDateTime)}
					</td>
					<td className="px-6 py-4">
						<span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
							<span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
							Pending
						</span>
						<span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
							Pending
						</span>
						<span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
							Reject
						</span>
						<span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
							Approve
						</span>
					</td>
					<td className="px-6 py-4 flex gap-x-2">
						<Link href={`/attendance/${value.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
						{/* <Link href={`/admin/event/edit/${value.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</Link> */}
					</td>
				</tr>
			)
		}
		return content
	}

	return (

		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						{/* <th scope="col" className="p-4">
                    <div className="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                    </div>
                </th> */}
						<th scope="col" className="px-6 py-3">
							#
						</th>
						<th scope="col" className="px-6 py-3">
							Name
						</th>
						<th title="Kilometers" scope="col" className="px-6 py-3">
							Distance
						</th>
						<th title="Kilometers" scope="col" className="px-6 py-3">
							Duration
						</th>
						<th scope="col" className="px-6 py-3">
							Attendance
						</th>
						<th scope="col" className="px-6 py-3">
							Status
						</th>
						<th scope="col" className="px-6 py-3">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{content()}
					{/* <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    AirTag
                </th>
                <td className="px-6 py-4">
                    Silver
                </td>
                <td className="px-6 py-4">
                    Accessories
                </td>
                <td className="px-6 py-4">
                    $29
                </td>
                <td className="px-6 py-4">
                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                </td>
            </tr> */}
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


export default Page
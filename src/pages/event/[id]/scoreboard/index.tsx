import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { GetServerSideProps } from "next/types"
import { db, Prisma, Event } from '@/db'

type Props = {
	score: {
		distance_sum: Prisma.Decimal
		userId: string
		name: string
		attendance: bigint
	}[]
	event: Event
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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
	const [score, event] = await Promise.all([
		db.$queryRaw`SELECT SUM(project.Event_Logs.distance) as distance_sum, CAST(COUNT(*) as INT) as attendance, project.Event_Logs.userId, project.User.name FROM project.Event_Logs LEFT JOIN User ON project.Event_Logs.userId = project.User.id WHERE project.Event_Logs.eventId = ${id} GROUP BY project.Event_Logs.userId`,
		db.event.findUnique({ where: { id }})
	])
	if (!event) return { notFound: true }
	// const query = await db.$queryRaw`SELECT * FROM project.Event_Logs`
	// const query = await db.event_Logs.findMany({
	// 	where: { eventId: id},

	// })
	// if (!query) return { notFound: true }

	return {
		props: {
			score,
			event,
		}
	}

	// return JSON.parse(JSON.stringify({
	// 	props: {
	// 		score: query
	// 	}
	// }))
}

const Page: NextPageWithLayout<Props> = (props) => {
	// console.log(props)
	return (
		<div className="container mx-auto">
			{/* <pre>
				{

					JSON.stringify(props, null, 4)
				}
			</pre> */}
			<p className="text-center my-2">Score Board</p>
			<p className="text-center">#{props.event.id} - {props.event.title}</p>
			<Table items={props.score} />
		</div>
	)

}

const Table = (props: { items: Props['score'] })  => {

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
						{value.name}
					</td>
					<td className="px-6 py-4">
						{value.distance_sum.toNumber() / 1000}
					</td>
					<td className="px-6 py-4">
						{value.attendance.toString()}
					</td>
					<td className="px-6 py-4 flex gap-x-2">
						{/* <Link href={`/event/${value.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link>
						<Link href={`/admin/event/edit/${value.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</Link> */}
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
							Total Distance
						</th>
						<th scope="col" className="px-6 py-3">
							Attendance
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
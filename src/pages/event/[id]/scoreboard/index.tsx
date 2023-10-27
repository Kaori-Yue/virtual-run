import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { GetServerSideProps } from "next/types"
import { db, Prisma, Event } from '@/db'
import { useRouter } from "next/router"
import useSWR from "swr"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import { ReturnType_Rank } from "@/pages/api/event/[id]/rank"
import { UserCurcle } from "@/components/svg"
import { SortDown } from "@/components/util/table"

type Props = {
	score: {
		distance_sum: Prisma.Decimal
		userId: string
		name: string
		attendance: bigint
	}[]
	event: Event
}


const Page: NextPageWithLayout = () => {
	// console.log(props)

	// if (isLoading || !data) return <span>Loading.</span>
	return (
		<div className="container mx-auto">
			{/* <pre>{ JSON.stringify(data, null, 2) }</pre> */ }
			<p className="text-center my-2">การจัดอันดับ</p>
			{/* <p className="text-center">#{props.event.id} - {props.event.title}</p> */ }
			{/* <Table items={props.score} /> */ }
			<Table />
		</div>
	)

}

const Table = () => {
	const router = useRouter()
	const { data, isLoading } = useSWR<ReturnType_Rank>(router.query.id ? `/api/event/${router.query.id}/rank` : null)
	const props: CompactType = {
		headers: [
			{
				className: 'px-6 py-3 w-16',
				text: '#'
			},
			// "#",
			"ผู้ใช้",
			<SortDown text="ระยะทางรวม" />,
			"จำนวนการส่งผล"],
		contents: [],
		isLoading: isLoading,
		// forceLoadingWhenNoContent: false
	}
	if (isLoading || !data || data.success === false) return <ReusableTable { ...props } />
	if (data.data.list.length === 0)
		return <span className="block text-center mt-4">ไม่พบข้อมูล</span>
	for (const item of data.data.list) {
		props.contents.push(
			[
				// {
				// 	className: 'px-6 py-3 ',
				// 	data: item.rank
				// },
				item.rank,
				{
					className: 'inline-flex items-center px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white',
					data: <>
						{ item.image
							? <img className="w-10 h-10 rounded-full" src={ item.image } />
							: <UserCurcle className="w-10 h-10" /> }
						<div className="pl-3">
							<div className="text-base font-semibold">{ item.email }</div>
							<div className="font-normal text-gray-500">{ item.name || "<Unset>" }</div>
						</div>
					</>

				}, item.distance_sum / 1000, item.times]
		)
	}
	// return <pre>{ JSON.stringify(data, null, 2) }</pre>
	return <>
		<span className="block mt-1 mb-3 text-center">{data.data.event?.title}</span>
		<ReusableTable { ...props } />
	</>
}

const Table22 = (props: { items: Props['score'] }) => {

	const content = () => {
		const content: JSX.Element[] = []
		for (const [key, value] of props.items.entries()) {
			content.push(
				<tr key={ key } className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
					<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
						{/* {value.title} */ }
						{ key + 1 }
					</th>
					<td className="px-6 py-4">
						{ value.name }
					</td>
					<td className="px-6 py-4">
						{ value.distance_sum.toNumber() / 1000 }
					</td>
					<td className="px-6 py-4">
						{ value.attendance.toString() }
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
					{ content() }
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
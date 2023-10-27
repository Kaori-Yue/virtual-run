// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement } from "react"
import Header from '@/components/layout/backOffice'
import { GetServerSideProps, InferGetStaticPropsType, InferGetServerSidePropsType } from "next/types"
import { db } from '@/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { News } from '@prisma/client'
import { useRouter } from "next/router"
import useSWR, { KeyedMutator } from "swr"
import { NewsListByUser } from "@/pages/api/users/news"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import dayjs from "dayjs"
import { formatDateTime } from "@/utils"
import { toast } from "react-toastify"
import Paginate from "@/components/ReusableTable/Paginate"
import { SortDown } from "@/components/util/table"
import { useSession } from "next-auth/react"
import { UserCurcle } from "@/components/svg"



const Page: NextPageWithLayout = () => {

	return (
		<div className="container mx-auto mt-4">
			{/* <pre> { JSON.stringify(data, null, 2) } </pre> */ }
			<div className="flex justify-end">
				<Link href={ '/admin/news/create' }>
					<button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
						เพิ่มข่าว
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
	const { data, isLoading, mutate } = useSWR<NewsListByUser>('/api/users/news')
	const props: CompactType = {
		headers: [
			'ชื่อข่าว',
			session?.role === 'ROOT' ? 'User' : undefined,
			<SortDown text='วันที่สร้าง' />,
			'แก้ไขล่าสุด',
			'การมองเห็น',
			'Action'],
		contents: [],
		isLoading: isLoading,
	}
	if (isLoading || !data) return <ReusableTable { ...props } />
	for (const [i, item] of data.items.entries()) {
		props.contents.push([
			<Link href={ `/news/${item.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ item.title }</Link>,
			session?.role === 'ROOT'
				?
				{
					className: 'inline-flex items-center px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white',
					data: <>
						{ item.user?.image
							? <img className="w-10 h-10 rounded-full" src={ item.user.image } />
							: <UserCurcle className="w-10 h-10" /> }
						<div className="pl-3">
							<div className="text-base font-semibold">{ item.user?.email }</div>
							<div className="font-normal text-gray-500">{ item.user?.name || "<Unset>" }</div>
						</div>
					</>
				}
				: undefined,
			dayjs(item.created_at).format(formatDateTime),
			dayjs(item.updated_at).format(formatDateTime),
			<label className="relative inline-flex items-center cursor-pointer">
				<input type="checkbox" className="sr-only peer" onChange={ e => setNewsVisible(item.id, e.target.checked, mutate) } checked={ item.active } />
				<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">

				</div>
				<span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{ item.active ? 'แสดง' : 'ซ่อน' }</span>
			</label>,
			{
				className: 'px-6 py-4 flex gap-x-2',
				data: <>
					{/* <Link href={ `/news/${item.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</Link> */ }
					<Link href={ `/admin/news/${item.id}/edit` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">แก้ไข</Link>
				</>
			}
		])
	}
	return <ReusableTable { ...props } paginate={ Paginate(data.meta) } />
}

const setNewsVisible = async (newsId: number, state: boolean, mutate: KeyedMutator<NewsListByUser>) => {
	console.log(newsId, state)

	try {
		await mutate(async (cache) => {
			if (!cache) return cache
			const req = await fetch('/api/users/news/' + newsId, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					active: state
				})
			})
			const res = await req.json() as News
			// return res
			const edit = cache.items.map(m => {
				if (m.id !== res.id)
					return m
				return { ...m, active: state }
			})
			return {
				...cache,
				items: edit
			}
		}, {
			optimisticData(currentData, displayedData) {
				if (!currentData) return currentData!
				const edit = currentData.items.map(m => {
					if (m.id !== newsId) return m
					return { ...m, active: state }
				})
				return {
					...currentData,
					items: edit,
				}
			},
			// populateCache(result, currentData) {
			// 	if (!currentData) return currentData!
			// 	const edit = currentData.items.map(m => {
			// 		if (m.id !== result.id) return m
			// 		return result
			// 	})
			// 	return {
			// 		...currentData,
			// 		items: edit,
			// 	}
			// },
			revalidate: false,
			rollbackOnError: true
		})
		toast.success('Success')
	} catch (e) {
		toast.error('Error')
	}
}

Page.defaultLayout = 'BACK_OFFICE'

export default Page
// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement, useState } from "react"
import Header from '@/components/layout/backOffice'
import { db } from '@/db'
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Event } from '@prisma/client'
import dayjs from 'dayjs'
import { useRouter } from "next/router"
import { formatDateTime } from "@/utils"
import useSWR, { KeyedMutator } from "swr"
import { EventListByUser } from "@/pages/api/users/event"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import { useSession } from "next-auth/react"
import Paginate from "@/components/ReusableTable/Paginate"
import { toast } from "react-toastify"
import { UserCurcle } from "@/components/svg"
import { SortDown } from "@/components/util/table"



const Page: NextPageWithLayout = () => {
	// const router = useRouter()

	return (
		<div className="container mx-auto mt-2">
			<div className="flex justify-end">
				<Link href={ '/admin/event/create' }>
					<button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
						เพิ่มกิจกรรม
					</button>
				</Link>
			</div>
			<Table />
			{/* { Table() } */ }
		</div>
	)


}

const Table = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const { data, isLoading, mutate } = useSWR<EventListByUser>(`/api/users/event?limit=10&page=${router.query.page ?? 1}`)
	const props: CompactType = {
		headers: [
			'ชื่อกิจกรรม',
			session?.role === 'ROOT' ? 'User' : undefined,
			<SortDown text='วันที่สร้าง'/>,
			'เวลาเริ่มกิจกรรม',
			'เวลาสิ้นสุดกิจกรรม',
			'การมองเห็น',
			'Action',
		],
		contents: [],
		isLoading: isLoading,
	}
	console.log('dataasdasdasda,', data,)



	if (isLoading || !data) return <ReusableTable { ...props } />
	props.preload = data.meta.next ?  `/api/users/event?limit=10&page=${data.meta.next}` : undefined
	for (const [i, item] of data.items.entries()) {
		props.contents.push([
			<Link href={ `/event/${item.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ item.title }</Link>,
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
			// session?.role === 'ROOT' ? item.user?.email : undefined,
			dayjs(item.created_at).format(formatDateTime),
			dayjs(item.register_startdate).format(formatDateTime),
			dayjs(item.register_enddate).format(formatDateTime),
			<label className="relative inline-flex items-center cursor-pointer">
				{/* <input type="checkbox" className="sr-only peer" onChange={e => setEventVisible(item.id, e.target.checked, mutate)} defaultChecked={item.active} /> */ }
				<input type="checkbox" className="sr-only peer" onChange={ e => setEventVisible(item.id, e.target.checked, mutate) } checked={ item.active } />
				<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
				{/* <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Checked toggle</span> */ }
				<span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{ item.active ? 'แสดง' : 'ซ่อน' }</span>
			</label>,
			<div className="flex gap-x-2">
				<Link href={ `/event/${item.id}/scoreboard` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">อันดับ</Link>
				<Link href={ `/admin/event/${item.id}/log` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">ประวัติ</Link>
				<Link href={ `/admin/event/${item.id}/edit` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">แก้ไข</Link>
			</div>
		])
	}
	return <>
		{/* <pre>{ JSON.stringify(data, null, 2) }</pre> */ }
		
		<ReusableTable { ...props } paginate={ Paginate(data.meta) } />
	</>
	// return <ReusableTable { ...props } paginate={ Paginate(data.meta) } />
}


const setEventVisible = async (eventId: number, state: boolean, mutate: KeyedMutator<EventListByUser>) => {
	try {
		console.log(eventId, state)
		// mutate((w) => {return 1}, {populateCache, optimisticData})
		await mutate(async (cache) => {
			if (!cache) return cache
			// await new Promise(resolve => setTimeout(resolve, 2000))
			const req = await fetch('/api/users/event/' + eventId, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					active: state
				})
			})
			const res = await req.json() as Event

			// return req
			// return await req.json() as Event
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
					if (m.id !== eventId)
						return m
					return { ...m, active: state }
				})
				return {
					meta: currentData.meta,
					items: edit
				}
			},
			// populateCache(result, currentData) {
			// 	if (!currentData) return currentData!
			// 	const edit = currentData.items.map(m => {
			// 		if (m.id !== result.id)
			// 			return m
			// 		return result
			// 	})
			// 	return {
			// 		meta: currentData.meta,
			// 		items: edit
			// 	}
			// },
			revalidate: false,
			rollbackOnError: true
		})
		toast.success('Success')
	} catch (e) {
		toast.error('Error')
	}

	// mutate<EventListByUser>(cache => {
	// 	if (!cache) return cache
	// 	return {
	// 		items: cache.items.map(m => {
	// 			if (m.id === eventId)
	// 				return { ...m, active: state }
	// 			return m
	// 		}),
	// 		meta: cache.meta
	// 	}
	// }, { revalidate: false })
	// const req = await fetch('/api/users/event/' + eventId, {
	// 	method: "PATCH",
	// 	headers: {
	// 		"Content-Type": "application/json"
	// 	},
	// 	body: JSON.stringify({
	// 		active: state
	// 	})
	// })
	// if (req.status !== 200) return toast.error('Error')
	// const res = await req.json() as Event
	// mutate(cache => {
	// 	if (!cache) return cache
	// 	return {
	// 		items: cache.items.map(m => {
	// 			if (m.id === eventId)
	// 				return res
	// 			return m
	// 		}),
	// 		meta: cache.meta
	// 	}
	// }, { revalidate: false })
	// return toast.success('Success')
	// await mutate(prev => {
	// 	console.log('mu', prev)
	// 	if (!prev) return prev
	// 	return {
	// 		items: prev.items.map(m => {
	// 			if (m.id === eventId) {
	// 				console.log('this', m)
	// 				m.active = state
	// 			}
	// 			return m
	// 		}),
	// 		meta: prev.meta
	// 	}
	// }, { revalidate: false })

	// this worked !
	// await mutate(cache => {
	// 	// console.log('mu', prev)
	// 	if (!cache) return cache
	// 	// const ff = prev.items.filter(f => f.id !== eventId)
	// 	// const x = { ...ff[eventId], active: !ff[eventId].active }
	// 	const f = [...cache.items.map(m => {
	// 		if (m.id === eventId) {
	// 			const avoidDup = { ...m }
	// 			avoidDup.active = state
	// 			return avoidDup
	// 		}
	// 		return m
	// 	})]
	// 	// const a = JSON.stringify(cache.items)
	// 	// const b = JSON.stringify(f)
	// 	// console.log('if, ', a === b)
	// 	// console.log(a, null, 2)
	// 	// console.log(b, null, 2)
	// 	return {
	// 		items: f,
	// 		// items: [...ff, x],
	// 		meta: cache.meta
	// 	}
	// }, { revalidate: true })

	// mutate(pre => pre, {
	// 	optimisticData: prev => {
	// 		// if (!prev) return prev
	// 		return {
	// 			items: prev!.items.map(m => {
	// 				if (m.id === eventId) {
	// 					console.log('this', m)
	// 					m.active = state
	// 				}
	// 				return m
	// 			}),
	// 			meta: prev!.meta
	// 		}
	// 	},
	// 	rollbackOnError: true
	// })

	// mutate(prev => prev)

}

Page.defaultLayout = 'BACK_OFFICE'

export default Page
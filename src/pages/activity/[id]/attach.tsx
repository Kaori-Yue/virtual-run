import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { db, Prisma, Activity, Event } from '@/db'
import dayjs from "dayjs"
import _duration from 'dayjs/plugin/duration'
import { durationToPace, fetcher, formatDateTime } from "@/utils"
import BadgeStatus from "@/components/BadgeStatus"
import { useRouter } from "next/router"
import FlashMessage from "@/components/flashMessage"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import useSWR, { KeyedMutator } from "swr"
import { ActivityAttached } from "@/pages/api/users/activity/[id]/attach"
import { EventListWithRangeTime } from "@/pages/api/event/open"
dayjs.extend(_duration)
import React from 'react';
import { toast } from 'react-toastify';

type Props = {
	activity: Prisma.ActivityGetPayload<{ include: { ActivitiesOnEvents: { include: { Event: true } } } }>
	events: Event[]
}


const Attach: NextPageWithLayout = () => {
	// console.log(props)
	// const available = props.events.filter(f => !props.activity.ActivitiesOnEvents.some(s => s.eventId === f.id))

	const router = useRouter()
	const { data, error, isLoading, mutate } = useSWR<ActivityAttached>(`/api/users/activity/${router.query.id}/attach`, fetcher, {
		revalidateOnFocus: false
	})
	if (isLoading || !data) return <span>Loading..</span>
	console.log(data)
	console.log(typeof data.assigned_at)
	return (
		<div className="container mx-auto mt-2">
			{/* <pre>
				{JSON.stringify(data, null, 4)}
			</pre> */}

			<p className="text-center my-2">Detail</p>
			<TableActivity act={ data } />
			<p className="text-center my-2">Attached</p>
			{/* <p className="text-center">#{props.event.id} - {props.event.title}</p> */ }
			{/* <Table items={props.score} /> */ }
			<TableAttached events={ data.ActivitiesOnEvents } />

			<p className="text-center my-2">Available</p>

			<TableAV
				// datetime as string or use Date.toISOString
				start={ data.assigned_at as unknown as string }
				end={ data.created_at as unknown as string }
				mutate={ mutate }
				removeEvents={ data.ActivitiesOnEvents.map(m => m.eventId) }
			/>
		</div>
	)

}

const TableActivity = ({ act }: { act: Activity }) => {
	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							Distance
						</th>
						<th title="Km" scope="col" className="px-6 py-3">
							Duration
						</th>
						<th scope="col" className="px-6 py-3">
							Pace
						</th>
						<th scope="col" className="px-6 py-3">
							Assign
						</th>
						<th scope="col" className="px-6 py-3">
							Create
						</th>
						<th scope="col" className="px-6 py-3">
							Screenshot
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
						<td scope="row" className="px-6 py-4 ">
							{ act.distance / 1000 }
						</td>
						<td className="px-6 py-4">
							{ dayjs.duration(act.duration, 'seconds').format("HH:mm:ss") }
						</td>
						<td className="px-6 py-4">
							{ durationToPace(act.duration, act.distance / 1000) }
						</td>
						<td className="px-6 py-4">
							{ dayjs(act.assigned_at).format(formatDateTime) }
						</td>
						<td className="px-6 py-4">
							{ dayjs(act.created_at).format(formatDateTime) }
						</td>
						<td className="px-6 py-4">
							<Link href={ act.screenshot } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
								Image
							</Link>
							{/* <BadgeStatus status={event.status} /> */ }
							{/* <input type="button" event-id={event.id} onClick={attachRequest} className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline" value='Attach' /> */ }
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}


const TableAV = (props: { removeEvents: number[], mutate: KeyedMutator<any>, start: string, end: string }) => {
	const router = useRouter()
	const { data, error, isLoading } = useSWR<EventListWithRangeTime>(`/api/event/open?start=${props.start}&end=${props.end}`, fetcher, {
		revalidateOnFocus: false
	})
	if (isLoading || !data) return <span>Loading..</span>
	const filter_data = data.items.filter(f => !props.removeEvents.includes(f.id))
	const attachRequest = async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		const eid = e.currentTarget.getAttribute('event-id') as string
		const aid = router.query.id as string
		const req = await fetch(`/api/users/activity/${router.query.id}/attach`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				eventId: +eid,
				activityId: aid
			})
		})
		if (req.status !== 200) {
			toast.error(`Can't Attach event.`)
			return
		}
		toast.success('Attached.')
		props.mutate()
	}
	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							#
						</th>
						<th title="Km" scope="col" className="px-6 py-3">
							Event Name
						</th>
						<th scope="col" className="px-6 py-3">
							Start
						</th>
						<th scope="col" className="px-6 py-3">
							End
						</th>
						<th scope="col" className="px-6 py-3">
							Action
						</th>
					</tr>
				</thead>
				<tbody>
					{ filter_data.map((event, key) => {
						// if (props.removeEvents.includes(event.id))
						// 	return
						return <tr key={ key } className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
								{ key + 1 }
							</th>
							<td className="px-6 py-4">
								{/* {event.title} */ }
								<Link href={ `/event/${event.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ event.title }</Link>
							</td>
							<td className="px-6 py-4">
								{ dayjs(event.register_startdate).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								{ dayjs(event.register_enddate).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								{/* <BadgeStatus status={event.status} /> */ }
								<input type="button" event-id={ event.id } onClick={ attachRequest } className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline" value='Attach' />
							</td>
						</tr>
					}) }
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

const TableAttached = (props: { events: Props['activity']['ActivitiesOnEvents'] }) => {
	return (
		<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							#
						</th>
						<th title="Km" scope="col" className="px-6 py-3">
							Event Name
						</th>
						<th scope="col" className="px-6 py-3">
							Event Start
						</th>
						<th scope="col" className="px-6 py-3">
							Event End
						</th>
						<th scope="col" className="px-6 py-3">
							Attached At
						</th>
						<th scope="col" className="px-6 py-3">
							Status
						</th>
					</tr>
				</thead>
				<tbody>
					{/* <TableContent list={props.data} /> */ }
					{ props.events.map((event, key) => {
						return <tr key={ key } className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
								{ key + 1 }
							</th>
							<td className="px-6 py-4">
								<Link href={ `/event/${event.Event.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ event.Event.title }</Link>
							</td>
							<td className="px-6 py-4">
								{ dayjs(event.Event.register_startdate).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								{ dayjs(event.Event.register_enddate).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								{ dayjs(event.created_at).format(formatDateTime) }
							</td>
							<td className="px-6 py-4">
								<BadgeStatus status={ event.status } />
							</td>
						</tr>
					}) }
				</tbody>
			</table>
		</div>
	)
}


export default Attach
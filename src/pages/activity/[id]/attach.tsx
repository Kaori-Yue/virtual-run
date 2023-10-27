import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { db, Prisma, Activity, Event } from '@/db'
import dayjs from "dayjs"
import _duration from 'dayjs/plugin/duration'
import { durationToPace, formatDateTime } from "@/utils"
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
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import { UserRegistry } from "@/pages/api/users/activity/[id]/registry"

type Props = {
	activity: Prisma.ActivityGetPayload<{ include: { ActivitiesOnEvents: { include: { Event: true } } } }>
	events: Event[]
}


const Attach: NextPageWithLayout = () => {
	// console.log(props)
	// const available = props.events.filter(f => !props.activity.ActivitiesOnEvents.some(s => s.eventId === f.id))

	const router = useRouter()
	const { data, error, isLoading, mutate } = useSWR<ActivityAttached>(`/api/users/activity/${router.query.id}/attach`, {
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

			<p className="text-center mt-4 my-1">รายละเอียด</p>
			<TableActivity act={ data } />
			<p className="text-center mt-4 my-1">กิจกรรมที่ส่งผลเข้าร่วมแล้ว</p>
			{/* <p className="text-center">#{props.event.id} - {props.event.title}</p> */ }
			{/* <Table items={props.score} /> */ }
			<TableAttached events={ data.ActivitiesOnEvents } />

			<p className="text-center mt-4 my-1">กิจกรรมที่สามารถส่งผลเข้าร่วมได้</p>

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
	const props: CompactType = {
		headers: ["ระยะทาง", "ระยะเวลา", "เพซ", "เวลาสร้าง", "เวลาทำกิจกรรม", "Screenshot"],
		contents: [[
			act.distance / 1000,
			dayjs.duration(act.duration, 'seconds').format("HH:mm:ss"),
			durationToPace(act.duration, act.distance / 1000),
			dayjs(act.created_at).format(formatDateTime),
			dayjs(act.assigned_at).format(formatDateTime),
			<Link href={ act.screenshot } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
				Image
			</Link>
		]]
	}
	return <ReusableTable { ...props } />
}

const TableAV = (props: { removeEvents: number[], mutate: KeyedMutator<any>, start: string, end: string }) => {
	const router = useRouter()
	// const { data, error, isLoading } = useSWR<EventListWithRangeTime>(`/api/event/open?start=${props.start}&end=${props.end}`, {
	// 	revalidateOnFocus: false
	// })
	const { data, error, isLoading } = useSWR<UserRegistry>(`/api/users/activity/${router.query.id}/registry`, {
		revalidateOnFocus: false
	})
	if (isLoading || !data) return <span>Loading..</span>
	// const filter_data = data.items.filter(f => !props.removeEvents.includes(f.id))
	const filter_data = data.filter(f => !props.removeEvents.includes(f.id))
	if (filter_data.length === 0)
	return <span className="block text-center">No Data</span>
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
		toast.success('ส่งผลสำเร็จ')
		props.mutate()
	}
	//
	const tableProps: CompactType = {
		headers: ["#", "ชื่อกิจกรรม", "เวลาเริ่มกิจกรรม", "เวลาสิ้นสุดกิจกรรม", "Action"],
		contents: [],
	}
	for (const [index, event] of filter_data.entries()) {
		tableProps.contents.push([
			index+1,
			<Link href={ `/event/${event.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ event.title }</Link>,
			dayjs(event.register_startdate).format(formatDateTime),
			dayjs(event.register_enddate).format(formatDateTime),
			<input type="button" event-id={ event.id } onClick={ attachRequest } className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline" value='เข้าร่วม' />
		])
	}
	return <ReusableTable { ...tableProps } />
}


const TableAttached = ({events }: { events: Props['activity']['ActivitiesOnEvents'] }) => {
	const data: CompactType = {
		headers: ["#", "ชื่อกิจกรรม", "เวลาเริ่มกิจกรรม", "เวลาสิ้นสุดกิจกรรม", "เวลาเข้าร่วม", "สถานะ", "Action"],
		contents: []
	}
	if (events.length === 0)
	return <span className="block text-center">No Data</span>
	for (const [index, event] of events.entries()) {
		data.contents.push([
			index+1,
			<Link href={ `/event/${event.Event.id}` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{ event.Event.title }</Link>,
			dayjs(event.Event.register_startdate).format(formatDateTime),
			dayjs(event.Event.register_enddate).format(formatDateTime),
			dayjs(event.created_at).format(formatDateTime),
			<BadgeStatus status={ event.status } />,
			<Link href={ `/event/${event.eventId}/scoreboard` } className="font-medium text-blue-600 dark:text-blue-500 hover:underline">อันดับ</Link>
		])
	}
	return <ReusableTable { ...data } />
}


export default Attach
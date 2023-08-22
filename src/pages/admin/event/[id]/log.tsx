import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types"
import { db, Prisma, State } from '@/db'
import dayjs from 'dayjs'
import _duration from 'dayjs/plugin/duration'
import superjson from 'superjson';
import { durationToPace, formatDateTime } from "@/utils"
import BadgeStatus from '@/components/BadgeStatus'
import useSWR, { mutate } from "swr"
import { useRouter } from "next/router"
import { LogEventById } from "@/pages/api/users/event/[id]/log"
import Loading from "@/components/Loading"
import { toast } from "react-toastify"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
dayjs.extend(_duration)
type Props = {
	// event: Prisma.EventGetPayload<{ include: { Event_Logs: true } }>
	// event: Prisma.EventGetPayload<{ include: { Event_Logs: { include: { user: true } } } }>
	event: Prisma.EventGetPayload<{ include: { ActivitiesOnEvents: { include: { Activity: { include: { User: true } } } } } }>
}



const Page: NextPageWithLayout = () => {
	// const {data, isLoading} = useSWR<LogEventById>(router.query.id ? `/api/users/event/${router.query.id}/log` : null)
	// if (isLoading || !data) return <Loading className="mt-4" size={ 10 } />
	return (
		<div className="container mx-auto mt-4">
			{/* <pre> { JSON.stringify(data, null, 4) } </pre> */ }
			{/* <p className="text-center my-2">Logs: {props.event.title}</p> */ }
			{/* <p className="text-center my-2">Total attendance: { data.meta.totalItem }</p> */ }
			{/* <p className="text-center">#{props.event.id} - {props.event.title}</p> */ }
			<Table />
		</div>
	)

}

const Table = () => {
	const router = useRouter()
	const { data, isLoading } = useSWR<LogEventById>(router.query.id && `/api/users/event/${router.query.id}/log`)
	const props: CompactType = {
		headers: ["#", "ชื่อ", "ระยะทาง", "ระยะเวลา","เพซ", "เวลาเข้าร่วมกิจกรรม", "เวลาแก้ไขสถานะล่าสุด", "สถานะ", "Action"],
		contents: [],
		isLoading: isLoading,

	}
	console.log(data, isLoading)
	if (isLoading || !data) return <ReusableTable { ...props } />
	for (const [i, item] of data.items.entries()) {
		props.contents.push([
			i + 1,
			item.Activity.userId,
			item.Activity.distance / 1000,
			dayjs.duration(item.Activity.duration, 'seconds').format('HH:mm:ss'),
			durationToPace(item.Activity.duration, item.Activity.distance / 1000),
			dayjs(item.created_at).format(formatDateTime),
			dayjs(item.updated_at).format(formatDateTime),
			<BadgeStatus status={ item.status } />,
			{
				className: 'px-6 py-3 flex gap-x-2',
				data: <ActionStatus state={ item.status } activityId={ item.Activity.id } eventId={ item.eventId } />
			},
		])
	}
	return <ReusableTable { ...props } />

}

type ActionStatusProps = { state: State, activityId: string, eventId: number }
const ActionStatus = (props: ActionStatusProps) => {
	const render: ActionStatusProps['state'][] = ['Approved', 'Pending', 'Reject'].filter(f => f !== props.state) as State[]
	return (
		<>
			{ render.map(m => <ButtonSetStatusActivity { ...props } state={ m } />) }
			{/* <button onClick={ () => setStatusActivity({ ...props, state: 'Approved' }) } type="button" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
				Approve
			</button>
			<button onClick={ () => setStatusActivity({ ...props, state: 'Pending' }) } type="button" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
				Pending
			</button>
			<button onClick={ () => setStatusActivity({ ...props, state: 'Reject' }) } type="button" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
				Reject
			</button> */}
			{/* <ActionPending { ...props }/> */ }
		</>
	)
}


const ButtonSetStatusActivity = (props: ActionStatusProps) => {
	// const router = useRouter()
	const textBtn = props.state === 'Approved' ? 'Approve' : props.state
	const styles: { [key in ActionStatusProps['state']]: string } = {
		Approved: 'text-green-600 dark:text-green-500',
		Pending: 'text-orange-500 dark:text-orange-400',
		Reject: 'text-red-600 dark:text-red-500',
	}
	const setStatus = () => {
		fetch(`/api/users/event/${props.eventId}/log`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				status: props.state,
				activityId: props.activityId
			})
		})
			.then(res => {
				if (res.status !== 200)
					throw new Error("Error", { cause: `HTTP ${res.status} - ${res.statusText}` });
				toast.success('Success')
				mutate<LogEventById>(`/api/users/event/${props.eventId}/log`)
			})
			// .then(json => {
			// 	toast.success('Success')
			// 	mutate<LogEventById>(`/api/users/event/${props.eventId}/log`)
			// })
			.catch(e => {
				toast.error(`Error: ${e.cause}`)
			})
	}
	return <button type="button" onClick={ setStatus } className={ `font-medium hover:underline ${styles[props.state]}` }>
		{ textBtn }
	</button>
}
// const setStatusActivity = (props: ActionStatusProps) => {
// 	fetch(`/api/users/activity/${props.activityId}/event/${props.eventId}`, {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json"
// 		},
// 		body: JSON.stringify({
// 			status: props.state
// 		})
// 	})
// 		.then(res => res.json())
// 		.then(json => {
// 			toast.success('Success' + JSON.stringify(json))
// 			mutate<LogEventById>(`/api/users/event/${props.eventId}/log`)
// 		})
// 		.catch(e => {
// 			toast.error('Error')
// 		})

// }

// const ActionPending = (props: ActionStatusProps) => {
// 	const req = () => {
// 		fetch(`/api/users/activity/${props.activityId}/event/${props.eventId}`, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json"
// 			},
// 			body: JSON.stringify({
// 				status: props.state
// 			})
// 		})
// 			.then(res => res.json())
// 			.then(json => {
// 				toast.success('Success' + JSON.stringify(json))
// 			})
// 			.catch(e => {
// 				toast.error('Error')
// 			})
// 	}
// 	return <button onClick={ req } type="button" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Pending</button>
// }

export default Page
Page.defaultLayout = 'BACK_OFFICE'
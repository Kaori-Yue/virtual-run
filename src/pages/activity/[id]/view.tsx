import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { db, Prisma, Activity } from '@/db'
import useSWR from "swr"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import _duration from 'dayjs/plugin/duration'
dayjs.extend(_duration)
import { durationToPace, formatDateTime } from '@/utils/index'
import ReusableTable, { CompactType } from "@/components/ReusableTable"

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
			<p className="text-center my-2">รายละเอียดการวิ่ง</p>
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
	const props:CompactType = {
		headers: ["ระยะทาง", "ระยะเวลา", "เพซ", "เวลาสร้าง", "เวลาทำกิจกรรม", "เวลาแก้ไขล่าสุด"],
		contents: [[
			item.distance / 1000,
			dayjs.duration(item.duration, 'seconds').format("HH:mm:ss"),
			durationToPace(item.duration, item.distance / 1000),
			dayjs(item.created_at).format(formatDateTime),
			dayjs(item.assigned_at).format(formatDateTime),
			dayjs(item.updated_at).format(formatDateTime)
		]]
	}
	return <ReusableTable { ...props } />
}


export default Page
import Card from '@/components/card'
import dayjs from 'dayjs'
import React from 'react'
import useSWR from 'swr'
import { EventList } from '../api/event'
import Loading from '@/components/Loading'
import locale_th from 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

dayjs.extend(buddhistEra)
dayjs.locale(locale_th)

function EventPage() {
	const router = useRouter()
	const { data, isLoading } = useSWR<EventList>(`/api/news?limit=8&page=${router.query.page || 1}`)
	if (isLoading || !data) return <Loading className='mt-4' />
	return (
		<div className='container mx-auto'>
			<Head>
				<title>{`News`}</title>
			</Head>
			<div className='flex mt-4 flex-wrap gap-y-4 gap-x-3 justify-center mx-auto'>
				{
					data.items.map((v, i) => {
						const subTitle = dayjs(v.register_startdate).format('DD MMM BB') + ' - ' + dayjs(v.register_enddate).format('DD MMM BB')
						return <Card key={ i } url={ `/news/${v.id}` } imageURL={ v.thumbnail } subTitle={ subTitle } title={ v.title }></Card>
					})
				}
			</div>
			<div className='my-4 flex justify-center gap-x-4'>
				{ data.meta.prev && <Link href={ `/news?page=${data.meta.prev}` } className={ `"font-medium text-blue-600 dark:text-blue-500 hover:underline"` }>
					หน้าที่แล้ว
				</Link> }
				{ data.meta.next && <Link href={ `/news?page=${data.meta.next}` } className={ `"font-medium text-blue-600 dark:text-blue-500 hover:underline"` }>
					หน้าถัดไป
				</Link> }
			</div>
		</div>
	)
}

export default EventPage
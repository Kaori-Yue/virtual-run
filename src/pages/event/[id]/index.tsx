
import { useState, type ComponentType, type ReactElement, useEffect } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps, InferGetServerSidePropsType, InferGetStaticPropsType } from 'next/types'
import { db } from '@/db'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { handlerStatusPage, isErrorPage, ErrorPageProps, getLayout } from '@/utils/errorPage'
import type { Event } from '@prisma/client'
import useSWR from 'swr'
import { fetcher } from '@/utils'
import { getEventById } from '@/pages/api/event/[id]'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

type Props = {
	event: Event
}


// export const getStaticProps: GetStaticProps = async ({params}) => {
// 	const id = params!.id as string
// 	const data = await getEventById(+id)
// 	// const res = await req.json()
// 	console.log(params)
// 	return {
// 		props: {
// 			fallback: {
// 				[`/api/event/${id}`]: data
// 			}
// 		}
// 	}
// }

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
	const id = params!.id as string
	const data = await getEventById(+id)
	if (!data) return { notFound: true }
	return {
		props: {
			event: data
		}
	}
}

export const getStaticPaths: GetStaticPaths = () => {
	const ids = [1]

	const paths = ids.map((id) => ({
		params: {
			id: String(id)
		}
	}))

	return {
		paths,
		fallback: 'blocking'
	}
}
// fallback -> https://tountoon.medium.com/next-js-แบบภาษาคน-the-series-ตอน-fallback-คืออะไร-f31b0fa2f301

const Page: NextPageWithLayout<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
	// if (isErrorPage(props)) {
	// 	return handlerStatusPage(props)
	// }
	// // const props = ctx as Props

	// console.log(props)
	// const router = useRouter()
	// const { data, error, isLoading } = useSWR<Event>(`/api/event/${router.query.id}`, fetcher, {
	// 	revalidateOnFocus: false
	// })
	const data = props.event

	// const [isLoading, setIsLoading] = useState(true)
	// const [data, setData] = useState<Event>()
	// useEffect(() => {
	// 	if (!router.query.id) return
	// 	fetch('/api/event/' + router.query.id)
	// 		.then(r => r.json())
	// 		.then(d => {
	// 			setData(d)
	// 			setIsLoading(false)
	// 		})
	// }, [router.query.id])

	// if (isLoading) <span>Loading..</span>
	return (
		<div className='container mx-auto'>
			<Head>
				<title>{ `Event - ${data?.title}` }</title>
			</Head>
			<br />
			{/* <pre>
				{JSON.stringify(props, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */ }
			<div dangerouslySetInnerHTML={ { __html: data?.content ?? '' } } />
			<ButtonRegister expireDate={ props.event.register_enddate } />
		</div>
	)
}

const ButtonRegister = ({ expireDate }: { expireDate: Date }) => {
	const style = `block mx-auto mt-4 mb-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800`

	if (expireDate.getTime() < new Date().getTime()) return <button type='button' className={`${style} bg-red-700 hover:bg-red-800focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900`}>
		หมดระยะเวลาเข้าร่วมแล้ว
	</button>
	const { status } = useSession()
	const router = useRouter()
	const { data, mutate } = useSWR(status === 'authenticated' ? '/api/users/registry?eventId=' + router.query.id : undefined)

	
	const register = async () => {
		try {
			const req = await fetch('/api/users/registry', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					eventId: router.query.id
				})
			})
			if (req.status !== 200) throw Error('Error')
			const res = await req.json()
			mutate(() => res)
			toast.success('Success')
		} catch (e) {
			toast.error('Error')
		}
	}
	if (data === null) return (
		<button type='button' onClick={ e => register() } className={ style }>
			คลิกเพื่อสมัครเข้าร่วมกิจกรรม
		</button>
	)
	if (data) return (
		<button type='button' className={ style }>
			เข้าร่วมแล้ว
		</button>
	)
	return (
		<button type='button' className={ style }>
			ลงชื่อเข้าใจเพื่อเข้าร่วม
		</button>
	)
}

export default Page

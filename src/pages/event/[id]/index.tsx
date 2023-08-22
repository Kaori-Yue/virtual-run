
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
		</div>
	)
}

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }



// for 404 page
// Page.appendLayout = 'FRONT_OFFICE'
// Page.getLayout = getLayout

export default Page

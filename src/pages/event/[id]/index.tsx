
import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps, InferGetServerSidePropsType } from 'next/types'
import { db } from '@/db'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { handlerStatusPage, isErrorPage, ErrorPageProps, getLayout } from '@/utils/errorPage'
import type { Event } from '@prisma/client'

type Props = {
	event: Event
}
export const getServerSideProps: GetServerSideProps<Props | ErrorPageProps> = async (req) => {
	const { params } = req
	// const defaultReturn: { props: ErrorPageProps } = {
	// 	props: { status: 404 }
	// }

	if (!(params && params.id)) return { notFound: true }
	if (!Number.isInteger(+params.id)) return { notFound: true }
	const q = await db.event.findUnique({
		where: {
			id: +(params.id as string)
		}
	})
	if (!q) return { notFound: true }


	// Pass data to the page via props
	// return {
	// 	props: { event: q}
	// }
	return JSON.parse(JSON.stringify({
		props: {
			event: q
		}
	}))
}


const Page: NextPageWithLayout<Props | ErrorPageProps> = (props) => {
	if (isErrorPage(props)) {
		return handlerStatusPage(props)
	}
	// const props = ctx as Props
	const router = useRouter()
	const id = router.query.id
	return (
		<div className='container mx-auto'>
			<Head>
				<title>{`Event - ${props.event.title}`}</title>
			</Head>
			<br />
			{/* <pre>
				{JSON.stringify(props, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */}
			<div dangerouslySetInnerHTML={{ __html: props.event?.content ?? '' }} />
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

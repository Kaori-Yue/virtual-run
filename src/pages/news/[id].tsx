
import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { News, db } from '@/db'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { getNewsById } from '../api/news/[id]'


type Props = {
	news: News
}
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
	const id = params!.id as string
	const data = await getNewsById(+id)
	if (!data) return { notFound: true }
	return {

		props: {
			news: data
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

// export async function getServerSideProps({ params }: { params: ParsedUrlQuery }) {
// 	// Fetch data from external API
// 	const q = await db.news.findUnique({
// 		where: {
// 			id: +(params.id as string),
// 		}
// 	})

// 	console.log('ssr')
// 	console.log(q)
// 	// Pass data to the page via props
// 	return { props:  JSON.parse(JSON.stringify(q)) }
// }

// export const getStaticProps: GetStaticProps = async ({ params }) => {
// 	const id = params?.id
// 	// return { props: {}}
// 	// const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
// 	// const post = await res.json()
// 	const post = faker.lorem.paragraph().trim()
// 	console.log('id' + id)
// 	return {
// 		revalidate: 10,
// 		props: {
// 			post,
// 		},
// 	}
// }

// export const getStaticPaths: GetStaticPaths = async () => {
// 	// const id = [...Array(10).keys()]
// 	const page = [...Array(10)].map((v, i) => ({ params: { id: String(i) } }))
// 	return {
// 		paths: page,
// 		// paths: [
// 		// 	{
// 		// 		params: {
// 		// 			// id: [...Array(10).keys()].join
// 		// 		},
// 		// 	}, // See the "paths" section below
// 		// ],
// 		fallback: true, // false or "blocking"
// 	}
// }

const News = (props: Props) => {
	const router = useRouter()
	const id = router.query.id
	return (
		<div className='container mx-auto'>
			<Head>
				<title>{`News - ${props.news.title}`}</title>
			</Head>
			<br />
			{/* {JSON.stringify(props, null, 4)} */}
			<br />
			<div dangerouslySetInnerHTML={{__html: props.news.content}}/>
		</div>
	)
}

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

export default News

// avoid hydration, because use faker to ramdom, server-side and client-side not match
// export default dynamic(() => Promise.resolve(Page), { ssr: false })

// const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
// ssr.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }
// export default ssr

import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { db } from '@/db'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'




export async function getServerSideProps({ params }: { params: ParsedUrlQuery }) {
	// Fetch data from external API
	const q = await db.news.findUnique({
		where: {
			id: +(params.id as string)
		}
	})

	console.log('ssr')
	console.log(q)
	// Pass data to the page via props
	return { props:  JSON.parse(JSON.stringify(q)) }
}

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

const Page: NextPageWithLayout = (props: any) => {
	const router = useRouter()
	const id = router.query.id
	return (
		<div className='container mx-auto'>
			<Head>
				<title>{`Event- ${props.title}`}</title>
			</Head>
			<Link href={'/index-no'}>index-no</Link>
			<br />
			<Link href={'/'}>index</Link>
			<br />
			{JSON.stringify(props, null, 4)}
			<br />
			<div className='flex flex-wrap gap-2 justify-center'>
				<br />
				{router.query.id}
			</div>
			<br />
			<div dangerouslySetInnerHTML={{__html: props.content}}/>
		</div>
	)
}

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

export default Page

// avoid hydration, because use faker to ramdom, server-side and client-side not match
// export default dynamic(() => Promise.resolve(Page), { ssr: false })

// const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
// ssr.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }
// export default ssr

import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import type { NextPageWithLayout } from '@/pages/_app'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())
type dType = {
	userId: number
	id: number
	title: string
	body: string
}
const Page: NextPageWithLayout = () => {
	// const {d ,e} = useSWR('/api/user', key => {})
	const {data, error, isLoading} = useSWR<dType>('https://random-data-api.com/api/v2/users', fetcher, {

	})
	if (isLoading || data === undefined)
		return <span>Loading..</span>
	return (
		<>
		<p>hello world3</p>
		<span>{JSON.stringify(data)}</span>
		<br />
		<span>{data.title}</span>
		<br />
		<Link href='/'>index</Link>
		</>
	)

}


export default Page

// avoid hydration, because use faker to ramdom, server-side and client-side not match
// const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
// ssr.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }
// export default ssr
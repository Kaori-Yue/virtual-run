
import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import type { NextPageWithLayout } from '@/pages/_app'
import Link from 'next/link'
import useSWR from 'swr'
// import {Dante} 'dante3'
// import {} from 'dante3'



const Page: NextPageWithLayout = () => {
	// const {d ,e} = useSWR('/api/user', key => {})
	return (
		<>
			{/* <Dante /> */}
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
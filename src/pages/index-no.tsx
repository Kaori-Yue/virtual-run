
import type { ComponentType, ReactElement } from 'react'
import Layout from '../components/layout/frontOffice'
import Header from '@/components/header'
import NestedLayout from '../components/layout/frontOffice/index'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import type { NextPageWithLayout } from '@/pages/_app'
import Link from 'next/link'

const Page: NextPageWithLayout = () => {
	return (
		<>
		<p>hello world3</p>
		<Link href='/'>index</Link>
		</>
	)

}

// function Page() {
// 	// const f = faker.image.urlPlaceholder
// 	return (
// 		<div className='container mx-auto'>
// 			<p>hello world</p>
// 			<div className='flex flex-wrap gap-2 justify-center'>
// 			{
// 				[...Array(1)].map((x, i) =>
// 					<Card key={i} imageURL={faker.image.urlPicsumPhotos()} title={faker.lorem.sentence().trim()} subTitle={faker.lorem.paragraph().trim()} />
// 				)
// 			}
// 			</div>
// 		</div>
// 	)
// }

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

// export default Page

// avoid hydration, because use faker to ramdom, server-side and client-side not match
const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
ssr.getLayout = function getLayout(page: ReactElement) {
	return (
		<Header>{page}</Header>
	)
}
export default ssr
// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement } from "react"
import Header from '@/components/layout/backOffice'


const Page: NextPageWithLayout = () => {
	return (
		<>
		<span className="block text-center mt-2 text-lg">Welcome to Back Office</span>
		{/* <p>hello world3</p> */}
		{/* <Link href='/'>index</Link> */}
		</>
	)
	
	
}


Page.getLayout = function getLayout(page: ReactElement) {
	return (
		<Header>{page}</Header>
	)
}

export default Page
import { NextPageWithLayout } from "@/pages/_app"
import Link from "next/link"
import { ReactElement } from "react"

const Forbidden: NextPageWithLayout = () => {
	return (
		<section className="bg-white dark:bg-gray-900">
			<div className="py-8 px-4 mx-auto max-w-screen-xl h-screen flex items-center lg:py-16 lg:px-6">
				<div className="mx-auto max-w-screen-sm text-center">
					<h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">403</h1>
					<p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Access Denied</p>
					<p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry, you don't have permission to access this page.</p>
					<Link href="/" className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">
						Back to Homepage
					</Link>
				</div>
			</div>
		</section>
	)
}

// Forbidden.getLayout = function getLayout(page: ReactElement) {
// 	return <span>222</span>
// }

export default Forbidden
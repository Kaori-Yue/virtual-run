import { ReactElement } from "react"
import FrontLayout from '@/components/layout/frontOffice'
import BackLayout from '@/components/layout/backOffice'
import type { NextPageWithLayout } from "@/pages/_app"
import Forbidden from "@/components/statusCode/forbidden_403"
import NotFound from "@/components/statusCode/notFound_404"


export type ErrorPageProps = {
	status?: number
}
type NewType<T1> = ReactElement<T1 & ErrorPageProps, NextPageWithLayout>

export function handlerStatusPage(props: ErrorPageProps) {
	if (props.status === 403) return <Forbidden />
	if (props.status === 404) return <NotFound />
	return <NotFound />
}

/** Type guard */
export const isErrorPage = <T1,>(props: ErrorPageProps | T1): props is ErrorPageProps => {
	return (props as ErrorPageProps).status !== undefined
}

// (page: ReactElement<ErrorPageProps, NextPageWithLayout<{}, {}>>)

export function getLayout<T1, T2 extends NextPageWithLayout>(page: ReactElement<T1 & ErrorPageProps, T2>) {
	if (page.props.status)
		return page

	const mode = page.type.appendLayout ?? 'FRONT_OFFICE'
	const Layout = mode === 'FRONT_OFFICE' ? FrontLayout : BackLayout
	// return page
	return (
		<Layout>
			{page}
		</Layout>
	)
	// return BackLayout({children: page})
}

// export function getLayout<T1 extends ErrorPageProps, T2 extends NextPageWithLayout>(page: ReactElement<T1, T2>) {
// 	if (page.props.status)
// 		return page

// 	const mode = page.type.appendLayout ?? 'FRONT_OFFICE'
// 	const Layout = mode === 'FRONT_OFFICE' ? FrontLayout : BackLayout
// 	// return page
// 	return (
// 		<Layout>
// 			{page}
// 		</Layout>
// 	)
// 	// return BackLayout({children: page})
// }

// export function getLayout(page: ReactElement<{ status?: number }, NextPageWithLayout>) {
// 	if (page.props.status)
// 		return page

// 	const mode = page.type.mode ?? 'FRONT_OFFICE'
// 	const Layout = mode === 'FRONT_OFFICE' ? FrontLayout : BackLayout
// 	// return page
// 	return (
// 		<Layout>
// 			{page}
// 		</Layout>
// 	)
// 	// return BackLayout({children: page})
// }
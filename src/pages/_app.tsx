import '@/styles/globals.css'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { Component, ComponentType, ReactElement, ReactNode, useEffect, useState } from 'react'
import { SessionProvider } from "next-auth/react"
import FrontLayout from '@/components/layout/frontOffice'
import BackLayout from '@/components/layout/backOffice'

import { Prisma } from '@prisma/client'
import SuperJSON from 'superjson'
import { ThemeProvider } from 'next-themes'
import { Middleware, SWRConfig } from 'swr'


// SuperJson.registerClass(Prisma.Decimal, { identifier: "DecimalJS" })
// const y= new Prisma.Decimal(24.454545)
// import {AppContextProvider} from './AppContextProvider'

SuperJSON.registerCustom<Prisma.Decimal, string>(
	{
		isApplicable: (v): v is Prisma.Decimal => Prisma.Decimal.isDecimal(v),
		serialize: v => v.toJSON(),
		deserialize: v => new Prisma.Decimal(v),
	},
	'decimal.js'
);

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	/** Override layout default, layout default is `FrontLayout` */
	getLayout?: (page: ReactElement<P, NextPageWithLayout>) => ReactNode
	/** if `getLayout` is set, will no layout to used, this attr set layout ... */
	appendLayout?: "FRONT_OFFICE" | "BACK_OFFICE"
	/** defaulf layout is `FRONT_OFFICE` */
	defaultLayout?: "FRONT_OFFICE" | "BACK_OFFICE"
}

// type AppPropsWithLayout = AppProps & ComponentType<{}> & {
// 	Component: NextPageWithLayout
// }

type AppPropsWithLayout<P> = AppProps<P> & {
	Component: NextPageWithLayout<P>;
};

import type { Session } from "next-auth";
import { fetcher } from '@/utils'
import { useRouter } from 'next/router'
import { awaitRouterMiddleware } from '@/middlewares/swr'

export default function MyApp({ Component, pageProps }: AppPropsWithLayout<{ session: Session; }>) {
	// Use the layout defined at the page level, if available
	// const getLayout = Component.getLayout ?? ((page) => page)
	// console.log(Component.displayName)
	// console.log(Component)


	// // return <Component {...pageProps} />
	// // return getLayout(<Component {...pageProps} />)
	// return getLayout(
	// 	<SessionProvider session={session}>
	// 	<Component {...pageProps} />
	//   </SessionProvider>
	// )


	// const y = Component.getLayout
	// if (y) {
	// 	const yy = y((page) => )
	// }


	// const c = Component.getLayout && Component.getLayout((x,y) => {})
	// const y = Component.getLayout ?? Component.getLayout((page) => )


	/*
	const getLayout = Component.getLayout
	if (getLayout)
		return getLayout(
			<SessionProvider session={session}>
				<Component {...pageProps} />
			</SessionProvider>,
		)
	// getLayout null
	return (
		<SessionProvider session={session}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</SessionProvider>
	)
	*/
	// if (mode === 'FRONT_OFFICE')

	// const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>)
	// return (
	// 	<SessionProvider session={session}>
	// 		{ getLayout(<Component {...pageProps} />) }
	// 	</SessionProvider>
	// )
	//
	//
	//
	//

	const providers: Props_Compose['components'] = [
		// defaultTheme: system
		[ThemeProvider, { attribute: "class", defaultTheme: 'dark' }],
		[SWRConfig, {
			value: {
				fetcher: fetcher,
				revalidateOnFocus: false,
				use: [awaitRouterMiddleware],
			}
		}],
		[SessionProvider, {
			session: pageProps.session,
			refetchOnWindowFocus: false
		}]

		// <ThemeProvider attribute="class" />
	]

	const getLayout = Component.getLayout
	if (getLayout)
		return (
			<Compose components={ providers }>
				{/* <SessionProvider session={ pageProps.session } refetchOnWindowFocus={false}> */ }
				{/* <BackLayout >
				</BackLayout> */}
				{/* <Component {...pageProps} /> */ }
				{ getLayout(<Component { ...pageProps } />) }
				{

					// getLayout(<Component {...pageProps}/>)
				}
				{/* </SessionProvider> */ }
			</Compose>
		)

	// const mode = Component.mode ?? "FRONT_OFFICE"
	// if (mode === 'BACK_OFFICE')
	// 	return (
	// 		<SessionProvider session={session}>
	// 			<BackLayout>
	// 				<Component {...pageProps} />
	// 			</BackLayout>
	// 		</SessionProvider>

	// 	)
	// console.log('END!')

	const Layout = Component.defaultLayout === 'BACK_OFFICE' ? BackLayout : FrontLayout
	return (
		<Compose components={ providers }>
			{/* <SessionProvider session={ pageProps.session } refetchOnWindowFocus={false}> */ }
			<Layout>
				<Component { ...pageProps } />
			</Layout>
			{/* </SessionProvider> */ }
		</Compose>
	)

}

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

// https://stackoverflow.com/questions/51504506/too-many-react-context-providers
// interface Props_Compose {
//     components: Array<React.JSXElementConstructor<React.PropsWithChildren<unknown>>>
//     children: React.ReactNode
// }
// function Compose(props: Props_Compose) {
//     const { components = [], children } = props

//     return (
//         <>
//             {components.reduceRight((acc, Comp) => {
//                 return <Comp>{acc}</Comp>
//             }, children)}
//         </>
//     )
// }

// const providers2: Props_Compose['components'] = [
// 	[ThemeProvider, {}],
// 	[ThemeProvider, 0],
// 	[ThemeProvider, ''],
// 	[ThemeProvider, 'getDate'],
// 	// <ThemeProvider attribute="class" />
// ]
type Props_Compose = {
	components: [
		React.JSXElementConstructor<React.PropsWithChildren<any>>,
		object?
	][]
	children: React.ReactNode
}

function Compose(props: Props_Compose) {
	const { components = [], children } = props
	return (
		<>
			{ components.reduceRight((acc, Comp) => {
				const [Component, options] = Comp
				return <Component { ...(options || {}) }>{ acc }</Component>
			}, children) }
		</>
	)
}

// not work with typescript
// https://javascript.plainenglish.io/how-to-combine-context-providers-for-cleaner-react-code-9ed24f20225e



// BigInt.prototype.toJSON = function () {
// 	const int = Number.parseInt(this.toString());
// 	return int ?? this.toString();
//   };

BigInt.prototype.toJSON = function () {
	return Number.parseInt(this.toString()) // for type number
	// return this.toString(); // for type string
};
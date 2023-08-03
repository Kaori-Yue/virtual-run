
import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps, InferGetServerSidePropsType } from 'next/types'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { handlerStatusPage, isErrorPage, ErrorPageProps, getLayout } from '@/utils/errorPage'
import { db, User, Event_Logs, Prisma } from '@/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import { excludeKeys } from '@/utils'
import HistoryAttendance from '@/components/historyAttendance'

type Props = {
	user: Omit<Prisma.UserGetPayload<{ include: { Event_Logs: { include: { event: { select: { title: true } } } } } }>, 'password'>
}

// https://www.prisma.io/docs/concepts/components/prisma-client/excluding-fields
// Exclude keys from user
// function exclude<U extends User, Key extends keyof User>(user: U, keys: Key[]): Omit<User, Key> {
// 	return Object.fromEntries(
// 		Object.entries(user).filter(([key]) => !keys.includes(key as Key))
// 	) as Omit<User, Key>

// }


export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const session = await getServerSession(ctx.req, ctx.res, authOptions)
	if (!session) {
		return { redirect: { destination: '/api/auth/signin', permanent: false } }
	}
	// const id = 1

	const _user = await db.user.findUnique({
		where: { id: session.user?.id },
		include: {
			Event_Logs: {
				orderBy: { created_at: 'desc' },
				include: {
					event: {
						select: { title: true }
					}
				}
			}
		}
	})
	if (!_user) return { notFound: true }
	const user = excludeKeys(_user, ['password'])
	return {
		props: {
			user
		}
	}
}

const Profile: NextPageWithLayout<Props> = (props) => {
	// const props = ctx as Props
	console.log(props)
	const router = useRouter()
	const id = router.query.id
	return (
		<div className='container mx-auto'>
			<Head>
				<title>My Profile</title>
			</Head>
			<br />
			{/* <pre>
				{JSON.stringify(props, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */}

			<HistoryAttendance data={props.user.Event_Logs} />

		</div>
	)
}


export default Profile


import type { ComponentType, ReactElement } from 'react'
// import type { NextPageWithLayout } from './_app'
import { faker } from '@faker-js/faker'
import Card from '@/components/card'
import dynamic from "next/dynamic"
import Link from 'next/link'
import { NextPageWithLayout } from '@/pages/_app'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, GetServerSideProps, InferGetServerSidePropsType } from 'next/types'
import { db, Event_Logs } from '@/db'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import { handlerStatusPage, isErrorPage, ErrorPageProps, getLayout } from '@/utils/errorPage'
import type { Event } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import styles from './form.module.css'
import { uploadToDiscord } from '@/utils/uploadImage'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { onInput, onInvalid } from '@/utils'

type Props = {
	event: Event
}
export const getServerSideProps: GetServerSideProps<Props> = async (req) => {
	// Fetch data from external API

	const { params } = req
	if (!(params && params.id)) {
		return { notFound: true }
	}
	if (!Number.isInteger(+params.id)) return { notFound: true }
	const q = await db.event.findUnique({
		where: {
			id: +(params.id as string)
		}
	})
	if (!q) {
		return { notFound: true }
	}


	// Pass data to the page via props
	return {
		props: {
			event: q
		}
	}
}

type Duration = {
	hour: number
	minute: number
	second: number
}
const Page: NextPageWithLayout<Props> = (props) => {
	// const props = ctx as Props
	const { data: session, status } = useSession()
	const router = useRouter()
	if (session === null)
		router.push('/api/auth/signin')
	const [distance, setDistance] = useState('')
	const id = router.query.id as string // type safe form id handle by server side, if not 404
	const [thumbnail, setThumbnail] = useState<File>()
	const [showValidate, setShowValidate] = useState(false)
	const [flashMessage, setFlashMessage] = useState<string>()
	const [duration, setDuration] = useState<Duration>({
		hour: 0,
		minute: 0,
		second: 0
	})

	const handleChangeDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setDuration(prevState => ({
			...prevState,
			[name]: +value
		}))
	};

	const [pace, setPace] = useState<string>('N/A')

	const css = React.useMemo(() => ({
		'input.date': 'rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
		input: 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
		submit: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
		label: 'block mb-2 text-sm font-medium text-gray-900 dark:text-white',
		'input.file': 'block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:py-2 file:px-2 file:mr-2',
		'input.duraion': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
		'input.label.duraion': 'block mb-2 text-sm text-gray-900 dark:text-white',
		'input.disabled': 'bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500',

	}), [])


	useEffect(() => {
		if (Number.isInteger(+duration.hour) && Number.isInteger(+duration.minute) && Number.isInteger(+duration.second) && Number.isFinite(+distance)) {
			const d = ((duration.hour * 60) + duration.minute + (duration.second / 60))
			const p = (Number(d) / Number(distance))
			const decimal = (p % 1) * 6 / 10
			// setPace(decimal.toString())
			// setPace( (p-decimal).toString() )
			setPace( (Math.trunc(p) + decimal).toFixed(2) )
		} else {
			setPace('N/A')
		}
	}, [distance, duration])


	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!thumbnail) {
			console.log('thumbnail is null', thumbnail)
			return
		}
		const image_url = await uploadToDiscord(thumbnail)
		const d = (duration.hour * 60 * 60) + (duration.minute * 60) + duration.second
		const payload: Pick<Event_Logs, 'distance' | 'screenshot' | 'duraion'> = {
			distance: +distance,
			screenshot: image_url,
			duraion: d
		}
		fetch(`/api/event/${id}/attendance/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		})
			.then(s => {
				console.log(s)
				if (s.status !== 200) {
					setFlashMessage(`${s.status}: ${s.statusText}`)
				}
			})
			.catch(err => {
				console.log('err')
				console.log(err)
				setFlashMessage(String(err))
			})
	}
	// const submit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
	// 	e.preventDefault()
	// 	if (!thumbnail) {
	// 		console.log('thumbnail is null', thumbnail)
	// 		return
	// 	}
	// 	const image_url = await uploadToDiscord(thumbnail)
	// 	const payload: Pick<Event_Logs, 'distance' | 'screenshot'> = {
	// 		distance: +distance,
	// 		screenshot: image_url
	// 	}
	// 	fetch(`/api/event/${id}/attendance/create`, {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json"
	// 		},
	// 		body: JSON.stringify(payload)
	// 	})
	// 		.then(s => {
	// 			console.log(s)
	// 			if (s.status !== 200) {
	// 				setFlashMessage(`${s.status}: ${s.statusText}`)
	// 			}
	// 		})
	// 		.catch(err => {
	// 			console.log('err')
	// 			console.log(err)
	// 			setFlashMessage(String(err))
	// 		})
	// }, [thumbnail])


	return (
		<div className='container mx-auto'>
			<Head>
				<title>{`Attendance - ${props.event.title}`}</title>
			</Head>

			{/* {id} */}
			{/* {props.event.title} */}
			{/* <pre>
				{JSON.stringify(props, null, 4)}
			</pre> */}

			{/* {JSON.stringify(props)} */}
			{/* <div dangerouslySetInnerHTML={{ __html: props.event?.content ?? '' }} /> */}

			<form onSubmit={submit} className={`${showValidate ? styles.validate : undefined} mt-2`}>
				<div className="mb-6">
					<label className={css.label}>Event name</label>
					<input disabled className={css['input.disabled']} placeholder={props.event.title} required />
				</div>
				<div className="mb-6">
					<label className={css.label}>Distance (Kilometers)</label>
					<input
						onInvalid={e => onInvalid(e, 'Enter Number Only')}
						onInput={onInput}
						// onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => e.target.setCustomValidity('Enter Number Only')}
						// onInput={(e: React.ChangeEvent<HTMLInputElement>) => e.target.setCustomValidity('')}
						pattern='(?<=^| )\d+(\.\d{1,4})?(?=$| )' value={distance} onChange={event => setDistance(event.target.value)} className={css.input} placeholder='Meters' required />
				</div>

				{JSON.stringify(duration, null, 2)}
				<fieldset className={'mb-6 border border-slate-400 px-2'} >
					<legend className={css.label}>Duraion</legend>
					<div className="grid gap-4 mb-4 md:grid-cols-3">
						<div>
							<label htmlFor="company" className={css['input.label.duraion']}>Hour</label>
							<div className="flex">
								<span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
									<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" className={'dark:fill-slate-400'}>
										{/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
										{/* <style>svg{fill:#f7f7f7}</style> */}
										{/* <style></style> */}
										<path d="M320 256l0 192c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V192L64 192 64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-192 256 0z" />
									</svg>
								</span>
								<input name='hour' pattern='^\d{1,2}' value={duration.hour} onChange={e => handleChangeDuration(e)} className={css['input.duraion']} />
							</div>
						</div>
						<div>
							<label htmlFor="company" className={css['input.label.duraion']}>Minute</label>
							<div className="flex">
								<span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
									<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" className={'dark:fill-slate-400'}>
										{/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
										<path d="M22.7 33.4c13.5-4.1 28.1 1.1 35.9 12.9L224 294.3 389.4 46.2c7.8-11.7 22.4-17 35.9-12.9S448 49.9 448 64V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V169.7L250.6 369.8c-5.9 8.9-15.9 14.2-26.6 14.2s-20.7-5.3-26.6-14.2L64 169.7V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 49.9 9.2 37.5 22.7 33.4z" />
									</svg>
								</span>
								<input name='minute' pattern='^\d{1,2}' value={duration.minute} onChange={e => handleChangeDuration(e)} className={css['input.duraion']} />
							</div>
						</div>
						<div>
							<label htmlFor="company" className={css['input.label.duraion']}>Second</label>
							<div className="flex">
								<span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
									<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" className={'dark:fill-slate-400'}>
										{/* <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
										<path d="M99.1 105.4C79 114 68.2 127.2 65.2 144.8c-2.4 14.1-.7 23.2 2 29.4c2.8 6.3 7.9 12.4 16.7 18.6c19.2 13.4 48.3 22.1 84.9 32.5c1 .3 1.9 .6 2.9 .8c32.7 9.3 72 20.6 100.9 40.7c15.7 10.9 29.9 25.5 38.6 45.1c8.8 19.8 10.8 42 6.6 66.3c-7.3 42.5-35.3 71.7-71.8 87.3c-35.4 15.2-79.1 17.9-123.7 10.9l-.2 0 0 0c-24-3.9-62.7-17.1-87.6-25.6c-4.8-1.7-9.2-3.1-12.8-4.3C5.1 440.8-3.9 422.7 1.6 405.9s23.7-25.8 40.5-20.3c4.9 1.6 10.2 3.4 15.9 5.4c25.4 8.6 56.4 19.2 74.4 22.1c36.8 5.7 67.5 2.5 88.5-6.5c20.1-8.6 30.8-21.8 33.9-39.4c2.4-14.1 .7-23.2-2-29.4c-2.8-6.3-7.9-12.4-16.7-18.6c-19.2-13.4-48.3-22.1-84.9-32.5c-1-.3-1.9-.6-2.9-.8c-32.7-9.3-72-20.6-100.9-40.7c-15.7-10.9-29.9-25.5-38.6-45.1c-8.8-19.8-10.8-42-6.6-66.3l31.5 5.5L2.1 133.9C9.4 91.4 37.4 62.2 73.9 46.6c35.4-15.2 79.1-17.9 123.7-10.9c13 2 52.4 9.6 66.6 13.4c17.1 4.5 27.2 22.1 22.7 39.2s-22.1 27.2-39.2 22.7c-11.2-3-48.1-10.2-60.1-12l4.9-31.5-4.9 31.5c-36.9-5.8-67.5-2.5-88.6 6.5z" />
									</svg>
								</span>
								<input name='second' pattern='^\d{1,2}' value={duration.second} onChange={e => handleChangeDuration(e)} className={css['input.duraion']} />
							</div>
						</div>
					</div>
				</fieldset>

				<div className="mb-6">
					<label className={css.label}>Pace</label>
					<input disabled readOnly value={pace} className={css['input.disabled']} placeholder='' />
				</div>


				<div className="mb-6">
					<label className={css.label} htmlFor="file_input">Upload screenshot</label>
					<input onChange={e => {
						if (e.target.files) {
							console.log('file:', e.target.files)
							setThumbnail(e.target.files[0])
						}
					}} required className={css['input.file']} id="file_input" type="file" />
				</div>





				{
					flashMessage && (
						<div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
							<svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
							</svg>
							<span className="sr-only">Info</span>
							<div>
								<span className="font-medium">Danger alert!</span> {flashMessage}
							</div>
						</div>
					)
				}

				<button onClick={() => { console.log('qqqcl'); setShowValidate(true) }} type="submit" className={css.submit}>Submit</button>
			</form>
		</div>
	)
}


// Page.appendLayout = 'BACK_OFFICE'
// Page.getLayout = getLayout

export default Page


// regexp distance
// https://stackoverflow.com/questions/5570820/regex-allow-digits-and-a-single-dot
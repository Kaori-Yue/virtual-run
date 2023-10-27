// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement, useEffect, useMemo, useState } from "react"
import Header from '@/components/layout/backOffice'
// import ReactQuill, { Quill } from 'react-quill';
import type { Quill, QuillOptions } from 'react-quill'
import dynamic from "next/dynamic";
// import 'react-quill/dist/quill.snow.css';
import Editor from '@/components/editor'
import sanitizeHtml from 'sanitize-html'
import Head from "next/head"
import Script from "next/script"
import React from "react"
import DatePicker from '@/components/datePicker'
import type AirDatepicker from "air-datepicker"
// import { Head } from 'next/document'
import { uploadToDiscord } from '@/utils/uploadImage'
import { useRouter } from "next/router"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'
import { preload } from "swr"
import { fetcher } from "@/utils"
import { useTheme } from "next-themes"

const sanitizeHtmlOptions: sanitizeHtml.IOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	allowedAttributes: {
		img: ['style', 'src', 'width'],
		p: ['style', 'class'],
		span: ['style', 'class'],
	}
}

const Editor2 = dynamic(() => import('@/components/editor'), {
	loading() {
		return <p>Loading..</p>
	},
	ssr: false
});

// const onDateSelect = (dp: {date: Date | Date[], formattedDate: string | string[], datepicker: AirDatepicker}) => {
// 	dp.datepicker.$el.id
// }

const createEvent = async (title: string, content: string) => {
	const req = await fetch('/api/news/create', {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			title,
			content
		})
	})
	const res = await req.json()
	console.log(res)
}

// const readFile = (_file: string) => {
// 	const fr = new FileReader()
// 	fr.onload
// }

const Page: NextPageWithLayout = () => {
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [thumbnail, setThumbnail] = useState<File>()
	const [thumbnailBlob, setThumbnailBlob] = useState('')
	const [startDate, setStartDate] = useState<Date | undefined>(undefined)
	const [endDate, setEndDate] = useState<Date | undefined>(undefined)
	const router = useRouter()
	const { theme } = useTheme()
	useEffect(() => {
		// thumbnail && setThumbnail(URL.createObjectURL(thumbnail as any))
		return () => {
			console.log('revok')
			URL.revokeObjectURL(thumbnailBlob)
		}
	}, [thumbnailBlob])

	const css = useMemo(() => ({
		'input.date': 'rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
		input: 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
		submit: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
		label: 'block mb-2 text-sm font-medium text-gray-900 dark:text-white'
	}), [])

	const onThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files, value } = event.target
		if (files === null || files.length === 0) return
		URL.createObjectURL(files[0])
		// setThumbnail(value)
		setThumbnail(files[0])
		setThumbnailBlob(URL.createObjectURL(files[0]))
	}

	// const submit = async (e: React.FormEvent<HTMLFormElement>) => {
	// 	e.preventDefault()
	// 	const toast_id = toast.loading("Image Uploading..")
	// 	try {
	// 		const image_url = await uploadToDiscord(thumbnail!)
	// 		toast.update(toast_id, {
	// 			render: 'Creating..'
	// 		})
	// 		const req = await fetch('/api/users/event', {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json"
	// 			},
	// 			body: JSON.stringify({
	// 				title,
	// 				content,
	// 				thumbnail: image_url,
	// 				register_startdate: startDate,
	// 				register_enddate: endDate,
	// 			})
	// 		})
	// 		if (req.status !== 200) throw Error
	// 		preload('/api/users/event', fetcher)
	// 		toast.update(toast_id, {
	// 			type: "success",
	// 			render: <>Create success.<br />Redirect in 5 seconds</>,
	// 			onClose: () => router.push('/admin/event'),
	// 			isLoading: false,
	// 			autoClose: 5000,
	// 		})

	// 	} catch (e) {
	// 		toast.update(toast_id, {
	// 			type: "error",
	// 			render: `${e instanceof Error ? `${e.name}: ${e.message} - ${e.cause}` : 'Error'}`,
	// 			isLoading: false,
	// 			closeOnClick: true,
	// 			autoClose: 5000,
	// 		})
	// 	}
	// }

	const createEvent = async () => {
		const image_url = await uploadToDiscord(thumbnail!)
		const req = await fetch('/api/users/event', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				title,
				content,
				thumbnail: image_url,
				register_startdate: startDate,
				register_enddate: endDate,
			})
		})
		const res = await req.json()
		return res
	}
	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		toast.promise(createEvent, {
			error: 'Error',
			pending: 'Creating..',
			success: {
				render: <>Created success.<br />Redirect in 5 seconds</>,
				onClose: () => router.push('/admin/event'),
				autoClose: 5000,
				closeOnClick: true,
			}
		})
	}

	return (
		<form onSubmit={ submit }>

			<div className="container mx-auto">
				<div className="mb-6">
					<label className={ css.label }>Event name</label>
					<input value={ title } onChange={ (event) => setTitle(event.target.value) } className={ css.input } placeholder="Event name" required />
				</div>

				<div className="mb-6">
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Thumbnail</label>
					{ thumbnailBlob ? <div className="text-center">
						<label className="relative group inline-block cursor-pointer ">
							<div className="group-hover:bg-black">
								<img className="group-hover:opacity-50 w-80 rounded-t-lg object-cover h-48 " src={ thumbnailBlob } />
							</div>
							<div className="opacity-20  group-hover:opacity-100 absolute inset-0 flex justify-center items-center flex-col">
								<span className="block text-2xl">Change</span>
							</div>
							<input onChange={ onThumbnailChange } id="dropzone-file" type="file" accept="image/*" className="hidden" />
							{/* <input ref={ ref } onChange={ limitFileSize } accept="image/*" name="avatar" type="file" className="hidden" /> */ }
						</label>
					</div> :
						<div className="flex items-center justify-center w-full">
							<label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
										<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
									</svg>
									<p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
									{/* <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p> */ }
								</div>
								{/* <input value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} id="dropzone-file" type="file" accept="image/*" className="hidden" /> */ }
								<input required onChange={ onThumbnailChange } id="dropzone-file" type="file" accept="image/*" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
							</label>
						</div>
					}
				</div>

				{/* Date */ }
				<div className="grid gap-6 mb-6 md:grid-cols-2">
					<div>
						<label htmlFor="company" className={ css.label }>Start Date</label>
						<div className="flex">
							<span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
								<svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
									<path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
								</svg>
							</span>
							<DatePicker required onSelect={ ({ date }) => setStartDate(date as Date) } placeholder="Start date" timepicker className={ css["input.date"] } />
						</div>
					</div>
					<div>
						<label htmlFor="company" className={ css.label }>End Date</label>
						<div className="flex">
							<span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
								<svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
									<path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
								</svg>
							</span>
							<DatePicker required onSelect={ ({ date }) => setEndDate(date as Date) } placeholder="End date" timepicker autoClose className={ css["input.date"] } />
						</div>
					</div>
				</div>

				<div className="mb-6">
					<label className={ css.label }>Event Content</label>
					<Editor2 value={ content } onChange={ setContent } />
				</div>
				<button type="submit" className={ css.submit }>Submit</button>

				<br />
				{/* { content } */}
				<br />
				<br />
				{/* { sanitizeHtml(content, sanitizeHtmlOptions) } */}
				<br />
				{/* <div dangerouslySetInnerHTML={ { __html: sanitizeHtml(content, sanitizeHtmlOptions) } } /> */}


			</div>
		</form>
	)


}

// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

Page.defaultLayout = 'BACK_OFFICE'
export default Page
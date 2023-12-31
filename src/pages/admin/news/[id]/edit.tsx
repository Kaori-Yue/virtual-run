// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ReactElement, useEffect, useState } from "react"
import Header from '@/components/layout/backOffice'
// import ReactQuill, { Quill } from 'react-quill';
import type { Quill, QuillOptions } from 'react-quill'
import dynamic from "next/dynamic";
// import 'react-quill/dist/quill.snow.css';
import Editor from '@/components/editor'
// import DOMPurify from 'dompurify'
import sanitizeHtml from 'sanitize-html'
import { GetServerSideProps } from "next/types"
import { useRouter } from "next/router"
import { db } from '@/db'
import { News } from '@prisma/client'
import NotFound from '@/components/statusCode/notFound_404'
import Forbidden from "@/components/statusCode/forbidden_403"
import { getLayout } from "@/utils/errorPage"
import { uploadToDiscord } from "@/utils/uploadImage"
import { toast } from "react-toastify"
type Props = {
	news?: News
	status?: number
	// error: boolean
}
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	// const router = useRouter()
	const id = ctx.params?.id
	if (typeof id !== 'string')
		return { props: {} }
	const query = await db.news.findUnique({ where: { id: +id } })
	if (!query) return { props: { status: 403 } }
	// if (query.userId !== '') {
	// 	return {
	// 		props: {
	// 			status: 403
	// 		}
	// 	}
	// }
	return {
		props: {
			news: JSON.parse(JSON.stringify(query)),
			error: false
		}
	}
}

// const sanitizer = DOMPurify.sanitize
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

const Page: NextPageWithLayout<Props> = (props) => {
	if (props.status === 404)
		return <NotFound />
	if (props.status === 403) {
		return <Forbidden />
	}
	const [title, setTitle] = useState(props.news?.title ?? '')
	const [content, setContent] = useState(props.news?.content ?? '')
	const [thumbnail, setThumbnail] = useState<File>()
	const [thumbnailBlob, setThumbnailBlob] = useState(props.news?.thumbnail ?? '')
	const router = useRouter()

	useEffect(() => {
		// thumbnail && setThumbnail(URL.createObjectURL(thumbnail as any))
		return () => {
			console.log('revok')
			URL.revokeObjectURL(thumbnailBlob)
		}
	}, [thumbnailBlob])

	const onThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files, value } = event.target
		if (files === null || files.length === 0) return
		URL.createObjectURL(files[0])
		// setThumbnail(value)
		setThumbnail(files[0])
		setThumbnailBlob(URL.createObjectURL(files[0]))
	}

	const updateNews = async () => {
		const image_url = thumbnail ? await uploadToDiscord(thumbnail) : thumbnailBlob
		const req = await fetch(`/api/users/news/${props.news?.id}`, {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title,
				content,
				thumbnail: image_url
			})
		})
		const res = await req.json() as News
		return res
	}
	const submit = async () => {
		const res = await toast.promise(updateNews, {
			error: 'Error',
			pending: 'Updating..',
			success: {
				render: <>Update success.<br />Redirect in 5 seconds</>,
				onClose: () => router.push('/admin/news'),
				autoClose: 5000,
				closeOnClick: true,
			}
		})
		console.log('submitlog,', res)
	}

	return (
		<div className="container mx-auto mt-2">
			<div className="mb-6">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News Title</label>
				<input value={ title } onChange={ (event) => setTitle(event.target.value) } className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" required />
			</div>


			<div className="mb-6">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Thumbnail</label>
				{/* <div className="flex items-center justify-center w-full">
				<label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
							<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
						</svg>
						<p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
					</div> */}
				{/* <input value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} id="dropzone-file" type="file" accept="image/*" className="hidden" /> */ }
				{/* <input onChange={ onThumbnailChange } id="dropzone-file" type="file" accept="image/*" className="hidden" />
				</label>
			</div> */}
				{/* { thumbnail?.name } */ }
				{/* Preview: */ }
				{/* <img src={ thumbnailBlob } /> */ }
				<div className="text-center">
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
				</div>
			</div>


			{/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */ }
			{/* <ReactQuillNoSSR modules={quillOptions.modules} theme="snow" value={value} onChange={setValue} /> */ }
			{/* <Editor value={value} onChange={setValue}/> */ }
			<div className="mb-6">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News Content</label>
				<Editor2 value={ content } onChange={ setContent } />
			</div>
			<button onClick={ submit } className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
				Submit
			</button>
			<br />
			{/* {content} */ }
			<br />
			<br />
			{/* {sanitizeHtml(content, sanitizeHtmlOptions)} */ }
			<br />
			{/* <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content, sanitizeHtmlOptions) }} /> */ }
		</div>
	)


}

// Page.mode = 'BACK_OFFICE'
// Page.getLayout = function getLayout(page: ReactElement<Props>) {
// 	if (page.props.status)
// 		return page
// 	return <Header children={page}/>
// }
Page.appendLayout = 'BACK_OFFICE'
Page.getLayout = getLayout
// Page.getLayout = function xy(page) {
// 	page.props
// 	const y = page as ReactElement<Props, NextPageWithLayout>
// 	// return getLayout<{status?: number}, NextPageWithLayout>(page)
// 	return getLayout(page)
// 	// return <></>
// }

export default Page

// async function imageHandler() {
// 	const input = document.createElement('input');
// 	input.setAttribute('type', 'file');
// 	input.setAttribute('accept', 'image/*');
// 	input.click();

// 	input.onchange = async () => {
// 		const file = input.files ? input.files[0] : null;
// 		let data = null;
// 		const formData = new FormData();

// 		const quillObj = quillRef?.current?.getEditor();
// 		const range = quillObj?.getSelection();

// 		if (file) {
// 			formData.append('file', file);
// 			formData.append('resource_type', 'raw');

// 			const responseUpload = await fetch(
// 				`${process.env.NEXT_PUBLIC_IMAGE_UPLOAD}/upload`,
// 				{ method: 'POST', body: formData }
// 			);

// 			data = await responseUpload.json();
// 			if (data.error) {
// 				console.error(data.error);
// 			}

// 			quillObj.editor.insertEmbed(range.index, 'image', data?.secure_url);
// 		}
// 	};
// };
// } 
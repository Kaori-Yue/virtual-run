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

// const QuillNoSSRWrapper = dynamic(
// 	async () => {
// 	  const { default: RQ } = await import('react-quill');
// 	  // eslint-disable-next-line react/display-name
// 	  return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
// 	},
// 	{ ssr: false }
//   );

// https://github.com/zenoamaro/react-quill/issues/122
// const ReactQuillNoSSR = dynamic(() => import('react-quill'), {
// 	loading() {
// 		return <p>Loading..</p>
// 	},
// 	ssr: false
// });

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

async function uploadToDiscord(image: File) {
	const ENDPOINT = `https://discord.com/api/webhooks/1124220458825420910/iInVKmF2ISUQBc6p5mrRWa-T1yprxpYWeBttUzMy2u9jNeodqbxbyQLYIXzlf0xhMluG`
	const payload = new FormData()
	payload.append('image1', image)
	payload.append('payload_json', JSON.stringify({
		'content': `filename: ${image.name}\nfilesize: ${image.size} bytes`
	}))
	const req = await fetch(ENDPOINT, {
		method: "POST",
		body: payload
	})
	console.log(req)
	const res = await req.json()
	console.log(res)
	return res.attachments[0].url // | proxy_url


}

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
	const [thumbnail, setThumbnail] = useState('')
	const [thumbnailBlob, setThumbnailBlob] = useState('')

	useEffect(() => {
		// thumbnail && setThumbnail(URL.createObjectURL(thumbnail as any))
		return () => {
			console.log('revok')
			URL.revokeObjectURL(thumbnailBlob)
		}
	}, [thumbnailBlob])

	const onThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files, value } = event.target
		if (files === null) return
		URL.createObjectURL(files[0])
		const y =files[0]
		setThumbnail(value)
		setThumbnailBlob(URL.createObjectURL(files[0]))
	}

	return (
		<div className="container mx-auto">
			<div className="mb-6">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News Title</label>
				<input value={title} onChange={(event) => setTitle(event.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" required />
			</div>

			Thumbnail
			<div className="flex items-center justify-center w-full">
				<label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
							<path stroke="currentColor" stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
						</svg>
						<p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
					</div>
					{/* <input value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} id="dropzone-file" type="file" accept="image/*" className="hidden" /> */}
					<input value={thumbnail} onChange={onThumbnailChange} id="dropzone-file" type="file" accept="image/*" className="hidden" />
				</label>
			</div>
			{thumbnail}
			Preview:
			<img src={thumbnailBlob} />


			{/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */}
			{/* <ReactQuillNoSSR modules={quillOptions.modules} theme="snow" value={value} onChange={setValue} /> */}
			{/* <Editor value={value} onChange={setValue}/> */}
			<div className="mb-6">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">News Content</label>
				<Editor2 value={content} onChange={setContent} />
			</div>
			<button onClick={() => createEvent(title, content)}>Submit</button>
			<br />
			{content}
			<br />
			<br />
			{sanitizeHtml(content, sanitizeHtmlOptions)}
			<br />
			<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content, sanitizeHtmlOptions) }} />
		</div>
	)


}


// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }
Page.defaultLayout = 'BACK_OFFICE'

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
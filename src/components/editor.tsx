
import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { ComponentType, Dispatch, LegacyRef, MutableRefObject, ReactElement, SetStateAction, useCallback, useMemo, useRef, useState } from "react"
import Header from '@/components/layout/backOffice'
// import ReactQuill, { Quill } from 'react-quill';
import type { QuillOptions, } from 'react-quill'
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import ReactQuill, { Quill } from 'react-quill';

//@ts-expect-error
import ImageResize from 'quill-image-resize-module-react'

Quill.register('modules/imageResize', ImageResize);
// import ImageResize from 'quill-image-resize-module';

// https://github.com/kensnyder/quill-image-resize-module/issues/107
//@ts-expect-error
// window.Quill = Quill
if (!window?.Quill?.find) {
	// window.Quill = {};
	//@ts-expect-error
	window.Quill = Quill;
}
//   }
// window?.Quill
// const ReactQuillNoSSR = dynamic(() => import('react-quill'), {
// 	loading() {
// 		return <p>Loading..</p>
// 	},
// 	ssr: false
// });

// const quillOptions: QuillOptions = {

// 	modules: {
// 		toolbar: [['bold', 'italic'], ['link', 'image']]
// 	}
// }




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

//
// const ReactQuill2 = dynamic(
// 	async () => {
// 		const { default: RQ } = await import("react-quill");
// 		// @ts-ignore
// 		return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
// 	},
// 	{
// 		ssr: false,
// 	}
// );
//
// 
type Props = {
	value: string
	onChange: Dispatch<SetStateAction<string>>
}
const Page = ({ value, onChange: setValue }: Props) => {
	// const [value, setValue] = useState('')
	// const imageHandler = () => {
	// 	console.log('i')
	// 	console.log(quillRef);
	// 	if (quillRef.current === null) {
	// 		console.log('quillRef undefined')
	// 		return
	// 	}
	// 	const editor = quillRef.current.getEditor();
	// 	console.log(editor)
	// 	const input = document.createElement("input");
	// 	input.setAttribute("type", "file");
	// 	input.setAttribute("accept", "image/*");
	// 	input.click();

	// 	input.onchange = async () => {
	// 		if (input.files === null) {
	// 			console.log('files is null from quill')
	// 			return
	// 		}
	// 		const file = input.files[0]
	// 		if (/^image\//.test(file.type)) {
	// 			console.log(file)
	// 			const url = await uploadToDiscord(file)
	// 			// const formData = new FormData();
	// 			// formData.append("image", file);
	// 			// const res = await ImageUpload(formData); // upload data into server or aws or cloudinary
	// 			// const url = res?.data?.url;
	// 			editor.insertEmbed(editor.getSelection() as unknown as number, "image", url);
	// 		} else {
	// 			// ErrorToast('You could only upload images.');
	// 		}
	// 	};
	// }

	const imageHandler = useCallback(() => {
		console.log('i')
		console.log(quillRef);
		if (quillRef.current === null) {
			console.log('quillRef undefined')
			return
		}
		const editor = quillRef.current.getEditor();
		console.log(editor)
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "image/*");
		input.click();

		input.onchange = async () => {
			if (input.files === null) {
				console.log('files is null from quill')
				return
			}
			const file = input.files[0]
			if (/^image\//.test(file.type)) {
				console.log(file)
				const url = await uploadToDiscord(file)
				// const formData = new FormData();
				// formData.append("image", file);
				// const res = await ImageUpload(formData); // upload data into server or aws or cloudinary
				// const url = res?.data?.url;
				editor.insertEmbed(editor.getSelection()?.index ?? 0, "image", url);
			} else {
				// ErrorToast('You could only upload images.');
			}
		};
	}, [])

	const quillRef = useRef<ReactQuill>(null)
	// quillRef.current?.getEditor
	// quillRef.current.
	const modules = useMemo<QuillOptions['modules']>(() => ({
		// formats: {['width']},
		// formats: ['bold', 'italic', 'underline', 'color'],
		toolbar: {

			container: [
				[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
				['bold', 'italic', 'underline', "strike"],
				[{ 'list': 'ordered' }, { 'list': 'bullet' },
				{ 'indent': '-1' }, { 'indent': '+1' }],
				['image', "link",],
				[{ 'color': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'] }]
			],
			handlers: {
				image: imageHandler
			}
		},
		imageResize: {
			parchment: Quill.import('parchment'),
			modules: ['Resize', 'DisplaySize', 'Toolbar']
			// displaySize: true
			// modules: ['Resize', 'DisplaySize']
		}
	}), [])
	return (
		<>
			{/* <ReactQuill2 forwardedRef={quillRef} modules={modules} value={value} onChange={setValue} /> */}
			<ReactQuill theme="snow" ref={quillRef} value={value} modules={modules} onChange={setValue} />
			{/* <ReactQuill theme="snow" value={value} modules={modules} onChange={setValue} /> */}
		</>
	)


}


// Page.getLayout = function getLayout(page: ReactElement) {
// 	return (
// 		<Header>{page}</Header>
// 	)
// }

export default Page

// const ssr = dynamic(() => Promise.resolve(Page), { ssr: false }) as ComponentType & NextPageWithLayout
// ssr.getLayout = function getLayout(page: ReactElement) {
// 	return page
// }
// export default ssr




// https://github.com/concrete-cc/quill-image-resize-module-react/issues/7
// fix image align not update
const BaseImageFormat = Quill.import('formats/image')
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
]
class ImageFormat extends BaseImageFormat {
	static formats(domNode: any) {
		return ImageFormatAttributesList.reduce(function (formats: any, attribute: any) {
			if (domNode.hasAttribute(attribute)) {
				formats[attribute] = domNode.getAttribute(attribute);
			}
			return formats;
		}, {});
	}
	format(name: string, value: unknown) {
		if (ImageFormatAttributesList.indexOf(name) > -1) {
			if (value) {
				this.domNode.setAttribute(name, value);
			} else {
				this.domNode.removeAttribute(name);
			}
		} else {
			super.format(name, value);
		}
	}
}
Quill.register(ImageFormat, true)
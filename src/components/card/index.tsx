

// const Page: NextPageWithLayout = () => {
//   return <p>hello world</p>
// }

import Link from "next/link"
import Image from "next/image"
// import sanitizeHtml from 'sanitize-html'

type Props = {
	imageURL: string
	title: string
	subTitle: string
	readMore?: string
	url?: string
}
export default function Page(props: Props) {
	return (
		<div className="w-80 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
			<Link href={ props.url ?? '#' } >
				{/* <Image
					src={props.imageURL}
					alt=""
					fill
					// width={500}
					// height={500}
					// className={`h-auto max-w-sd`} max-h-52 object-contain overflow-hidden 
				/> */}
				<div className="flex flex-col items-center">
					<img className="rounded-t-lg object-cover h-48 min-w-full" src={ props.imageURL } alt="" />
				</div>
				{/* </Link> */ }
				<div className="px-3 py-2">
					{/* <Link href={props.url ?? '#'}> */ }
					<h5 title={ props.title } className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">{ props.title }</h5>
					{/* </Link> */ }
					<p className="mb-3 text-sm font-normal text-gray-700 dark:text-gray-400">{ props.subTitle }</p>
					{/* <Link href={props.url ?? '#'} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
					{props.readMore ?? "Read more"}
					<svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
						<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
					</svg>
				</Link> */}
				</div>
			</Link>
		</div>
	)
}

// Page.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <Header>
// 		{page}
//       {/* <NestedLayout>{page}</NestedLayout> */}
//     </Header>
//   )
// }

// export default Page
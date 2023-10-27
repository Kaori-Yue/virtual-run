import { MetaPage } from '@/utils/api'
import Link from 'next/link'
import React from 'react'


function Paginate(props: MetaPage) {
	const style = 'flex items-center justify-center  h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
	const styleSelect = 'flex items-center justify-center h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'

	const paginate: React.JSX.Element[] = []
	if (props.lastPage > 1)
		for (let index = props.currentPage - 2; (index <= props.lastPage && index < props.currentPage + 3); index++) {
			if (index < 1) continue

			paginate.push(<li className={ index !== props.currentPage ? style : styleSelect } >
				<Link href={ { query: { page: index } } } className='px-3 py-2'>
					{ index }
				</Link>
			</li>)
		}
	return (
		<nav className="flex items-center justify-between pt-4 px-2 pb-1 " aria-label="Table navigation">
			<span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">
				{ props.prev === null
					? '1'
					: ((props.currentPage - 1) * props.perPage) + 1 }
				-
				{ props.next === null
					? props.totalItem
					: (props.currentPage * props.perPage) } </span>
				of
				<span className="font-semibold text-gray-900 dark:text-white"> { props.totalItem } </span>
			</span>
			<ul className="inline-flex -space-x-px text-sm h-8 [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
				{ props.currentPage > 1 ?
					<li className="flex items-center justify-center h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
						<Link className='px-3 py-2' href={ {
							query: {
								page: props.prev ?? props.currentPage
							}
						} } >
							Previous
						</Link>
					</li> : undefined }
				{ paginate }

				{/* <li className={ style } >
					<a href="#" >
						5
					</a>
				</li> */}
				{ props.currentPage < props.lastPage ?
					<li className="flex items-center justify-center h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
						<Link className='px-3 py-2' href={ {
							query: {
								page: props.next ?? props.currentPage
							}
						} } >
							Next
						</Link>
					</li>
					: undefined }
			</ul>
		</nav>
	)
}

export default Paginate
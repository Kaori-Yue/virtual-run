import React, { HTMLAttributes } from 'react'
import SkeletonContent from './SkeletonContent'
import useSWR from 'swr'

type HeaderOptions = {
	text: string | React.JSX.Element
	/** deafult `px-6 py-3` */
	className?: string
	title?: string
}

//

type Cell = string | number | React.JSX.Element | undefined | null

type RowNode = {
	row: CellNode[]
	/** RowNode \<tr\> deafult `bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600` */
	className?: string
}

type CellNode = {
	data: Cell
	/** CellNode deafult `px-6 py-3` */
	className?: string
} | Cell

export type CompactType = {
	headers: (HeaderOptions | string | React.JSX.Element | undefined)[]
	contents: (RowNode | CellNode[] | Cell[])[]
	paginate?: React.JSX.Element
	isLoading?: boolean
	forceLoadingWhenNoContent?: boolean
	/** URL of next page */
	preload?: string,
}

const isCell = (c: CellNode): c is Cell => {
	// return !Object.hasOwn(c as object, 'data') // not works with undefined
	return (c === undefined) || c === null || !Object.hasOwn(c as object, 'data')
}

const isHeader = (c: HeaderOptions | React.JSX.Element): c is HeaderOptions => {
	return Object.hasOwn(c as object, 'text')
}

function ReusableTable({ headers, contents, paginate, isLoading, preload, forceLoadingWhenNoContent = true, ...props }: CompactType) {
	useSWR(preload ? preload : null, { revalidateIfStale: false }) // if cache, not fetch
	const headerStyleDefault = 'px-6 py-3'
	const cellStyleDefault = 'px-6 py-3'
	const headStyleDefault = 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'
	const rowStyleDefalut = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
	console.log(headers, contents)
	// const h = headers as NonNullable<CompactType['headers'][]>
	return (
		<>
			<div className={ `relative overflow-x-auto shadow-md sm:rounded-lg` }>
				<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead className={ headStyleDefault }>
						<tr>
							{ headers.filter((f): f is NonNullable<typeof f> => f !== undefined).map((v, i) => typeof v !== 'string'
								? isHeader(v)
									? <th key={ i } title={ v.title } className={ v.className ? v.className : headerStyleDefault }>{ v.text }</th>
									: <th key={ i } className={ headerStyleDefault }>{ v }</th>
								: <th key={ i } className={ headerStyleDefault }>{ v }</th>) }
						</tr>
					</thead>
					<tbody>

						{
							isLoading
								? <SkeletonContent cols={ headers.filter(f => f !== undefined).length } />
								: (forceLoadingWhenNoContent && contents.length === 0)
									? <SkeletonContent cols={ headers.filter(f => f !== undefined).length } />
									: contents.map((row_node, row_index) => {
										if (row_node instanceof Array) {
											row_node
											return <tr key={ row_index } className={ rowStyleDefalut }>
												{ row_node.map((c, ci) => {
													c
													// if (Object.hasOwn(c as object, 'data'))
													if (!isCell(c)) {
														// if (c === undefined) return <span>123</span>

														return <td className={ c.className ? c.className : cellStyleDefault }>{ c.data }</td>
													}
													if (c === undefined) return
													return <td className={ cellStyleDefault } >{ c }</td>
												})
												}
											</tr>
										}
										return <tr key={ row_index } className={ row_node.className ? row_node.className : rowStyleDefalut }>
											{ row_node.row.map((c, ci) => {
												if (typeof c !== 'object')
													return <td className={ '' } >{ c }</td>
												// if (Object.hasOwn(c, 'data') )
												if (!isCell(c))
													return <td className={ c.className ? c.className : cellStyleDefault }>{ c.data }</td>
												return <td className={ cellStyleDefault } >{ c }</td>
											}) }
										</tr>
									})
						}
					</tbody>
				</table>

			</div>
			{ paginate && paginate }
		</>
	)
}

export default ReusableTable




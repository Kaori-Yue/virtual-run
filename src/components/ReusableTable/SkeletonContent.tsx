import React from 'react'

type Props = {
	/** default `5` */
	rows?: number
	cols: number
}

function* generatorColumn() {
	let key = 1
	while (true) {
		if (key % 4 === 0)
			yield <div className="flex items-center space-x-2">
				<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-12"></div>
				<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-12"></div>
			</div>
		if (key % 3 === 0)
			yield <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 max-w-[640px]"></div>
		yield <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
		key++
	}
}
function SkeletonContent(props: Props) {
	const content: React.JSX.Element[] = []
	const rowStyle = 'px-6 py-4'
	for (let index = 0; index < (props.rows ?? 5); index++) {
		const colGen = generatorColumn()
		// const x = colStyle.next().value
		content.push(
			<tr className="animate-pulse bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
				{ [...Array(props.cols).keys()].map((i) => <td className={ rowStyle }>
					{ colGen.next().value! }
				</td>) }
				{/* <td className={ rowStyle }>
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
				</td>
				<td className={ rowStyle }>
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className={ rowStyle }>
					<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 max-w-[640px]"></div>
				</td>
				<td className={ rowStyle }>
					<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 max-w-[640px]"></div>
				</td>
				<td className={ rowStyle }>
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className={ rowStyle }>
					<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px]"></div>
				</td>
				<td className={ rowStyle }>
					<div className="flex items-center space-x-2">
						<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-12"></div>
						<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-12"></div>
					</div>
				</td> */}
			</tr>
		)
	}
	return content
}

export default SkeletonContent
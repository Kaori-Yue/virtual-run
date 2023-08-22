import React from "react"


type Props = {
	prefix?: string
	message: string
	type: 'RED' | 'GREEN' | 'BLUE'
}
export default function FlashMessage(props: Props) {
	const css: { [key in typeof props.type]: string } = React.useMemo(() => ({
		RED: 'text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800',
		GREEN: 'text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800',
		BLUE: 'text-blue-800 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800',
	}), [])
	return (
		<div className={`flex items-center p-4 mb-4 text-sm border rounded-lg ${css[props.type]}`} role="alert">
			{ props.prefix && <span className="font-medium mr-1">{ props.prefix }</span> }
			{ props.message }
		</div>
	)
}

// https://flowbite.com/docs/components/alerts/
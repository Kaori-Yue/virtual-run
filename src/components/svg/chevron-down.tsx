import React from 'react'

type Props = {
	className?: string
}
export function ChevronDown(props: Props) {
	return (
		<svg className={props.className || 'w-3 h-3'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 5">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="m1 1 4 4 4-4" />
		</svg>
	)
}

import type { State } from '@/db'

export default function badgeStatus (props: { status: State })  {
	const State: { [key in typeof props.status]: JSX.Element } = {
		Pending: <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
			<span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
			Pending</span>,
		Approved: <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
			<span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
			Approved
		</span>,
		Reject: <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
			<span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
			Reject
		</span>
	}
	return State[props.status]
}
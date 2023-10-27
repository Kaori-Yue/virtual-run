import { ChevronDown } from "../svg"

export const SortDown = ({ text }: { text: string }) => {
	return <div className="flex items-center">
		{ text }
		<ChevronDown className='w-3 h-3 ml-1.5' />
	</div>
}
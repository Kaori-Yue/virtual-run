import AirDatepicker, { AirDatepickerOptions, } from 'air-datepicker'
import "air-datepicker/air-datepicker.css"
// import localeEn from 'air-datepicker/locale/en'
import localeTh from 'air-datepicker/locale/th'

import { useEffect, useRef } from 'react'


type Props = Partial<AirDatepickerOptions> & {
	className?: string
	placeholder?: string
	required?: boolean
}
function AirDatePickerComponent(props: Props) {
	const input = useRef<HTMLInputElement>(null)
	const datePicker = useRef<AirDatepicker | null>(null)
	const { className, placeholder, required, ...options } = props
	useEffect(() => {
		if (input.current) {
			datePicker.current = new AirDatepicker(input.current, { locale: localeTh, ...options })
		}
	}, [])

	useEffect(() => {
		datePicker.current?.update({ ...options })
	}, [props])


	return <input ref={input} className={className} placeholder={placeholder} required={required} />
}

export default AirDatePickerComponent
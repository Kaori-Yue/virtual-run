export function excludeKeys<T1 extends object, Key extends keyof T1>(user: T1, keys: Key[]) {
	return Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key as Key))) as Omit<T1, Key>
}

export const onInvalid = <T extends HTMLInputElement>(input: React.FormEvent<T>, message: string) => {
	const target = input.target as EventTarget & T
	target.setCustomValidity(message)
}

export const onInput = <T extends HTMLInputElement>(input: React.FormEvent<T>) => {
	const target = input.target as EventTarget & T
	target.setCustomValidity("")
}

// class Table<T, U> {
//     Select = function <K extends Partial<Record<keyof T, true>>>(this: Table<T, U>, properties: K): Table<Omit<T, keyof K>, Pick<T, keyof K> & U> {

//         return null!;
//     }
// }

// // new Table<{ a: 0, b: 0}, {}>().Select({ a: true }) //ok
// // new Table<{ a: 0, b: 0}, {}>().Select({ a: true, a: true }) // err
// // new Table<{ a: 0, b: 0}, {}>().Select({ a: true, b: true }) //ok

export function includeKeys<T1 extends object, Key extends keyof T1>(user: T1, keys: Key[]) {
	return Object.fromEntries(Object.entries(user).filter(([key]) => keys.includes(key as Key))) as Pick<T1, Key>
}

// export function includeKeys2<T1 extends object, Key extends keyof T1>(user: T1, keys: { [P in Key]: T1[P] }  ) {
// 	return Object.fromEntries(Object.entries(user).filter(([key]) => keys.includes(key as Key))) as Pick<T1, Key>
// }

// const tt = {
// 	key1: 'keya',
// 	key2: 'keyb',
// 	key3: 'keyc'
// }

// includeKeys2(tt,  {}   )

// // Pick<T, K extends keyof T> = { [P in K]: T[P]; }
// import type {Event_Logs} from '@/db'
// type w = Pick<Event_Logs, 'created_at'>

/**
 *
 * @param seconds
 * @param distance Kilometers
 */
export function durationToPace(seconds: number, distance: number) {
	const _minutes = Math.trunc(seconds / 60)
	const _seconds = seconds % 60
	// _second / 60 to 100 clock
	const pace = (_minutes + _seconds / 60) / distance
	const decimal = ((pace % 1) * 6) / 10
	//
	return (Math.trunc(pace) + decimal).toFixed(2)
}

export const formatDateTime = "DD/MM/YY HH:mm:ss"

export const fetcher = async <T extends any>(k: string): Promise<T> => (await fetch(k)).json() as T
export const fetcher_multiple = async <T extends any>(urls: string[]): Promise<T> => Promise.all(urls.map((url) => fetcher(url))) as T
// https://github.com/vercel/swr/discussions/786

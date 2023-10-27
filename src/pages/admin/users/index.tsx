// import { useSession, getSession } from "next-auth/react"

import Link from "next/link"
import { NextPageWithLayout } from "@/pages/_app"
import { FormEvent, FormEventHandler, ReactElement, RefObject, useEffect, useMemo, useRef, useState } from "react"
import Header from '@/components/layout/backOffice'
import { GetServerSideProps, InferGetStaticPropsType, InferGetServerSidePropsType } from "next/types"
import { db } from '@/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { News, User } from '@prisma/client'
import { useRouter } from "next/router"
import useSWR, { KeyedMutator, mutate } from "swr"
import { NewsListByUser } from "@/pages/api/users/news"
import ReusableTable, { CompactType } from "@/components/ReusableTable"
import dayjs from "dayjs"
import { formatDateTime } from "@/utils"
import { UserByRole } from "@/pages/api/users/role"
import { toast } from "react-toastify"
import ButtonLoading from "@/components/ButtonLoading"
import { useSession } from "next-auth/react"
import { UserCurcle } from "@/components/svg"
import { renderRole } from "@/components/util/Role"




const Page: NextPageWithLayout = () => {
	return (
		<div className="container mx-auto mt-4">
			{/* <pre> { JSON.stringify(data, null, 2) } </pre> */ }
			{/* <div className="flex justify-end">
				<Link href={ '/admin/news/create' }>
					<button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
						Add News
					</button>
				</Link>
			</div> */}
			<Table />
		</div>
	)
}

type UserSecure = Omit<User, 'password' | 'emailVerified'>
const Table = () => {
	const router = useRouter()
	const { data, isLoading, mutate } = useSWR<UserSecure[]>('/api/users/role')
	const [isShow, setIsShow] = useState(false)
	const [editUserPlaceHolder, setEditUserPlaceHolder] = useState<UserSecure>()
	const props: CompactType = {
		headers: ['ผู้ใช้', 'Role', 'วันที่สมัครใช้งาน', 'Action'],
		contents: [],
		isLoading: isLoading,
	}
	if (isLoading || !data) return <ReusableTable { ...props } />
	for (const [i, item] of data.entries()) {
		props.contents.push([
			{
				className: 'inline-flex items-center px-6 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white',
				data: <>
					{ item.image
						? <img className="w-10 h-10 rounded-full" src={ item.image } />
						: <UserCurcle className="w-10 h-10" /> }
					<div className="pl-3">
						<div className="text-base font-semibold">{ item?.email }</div>
						<div className="font-normal text-gray-500">{ item?.name || "<Unset>" }</div>
					</div>
				</>
			},
			renderRole(item.role),
			// item.role,
			dayjs(item.created_at).format(formatDateTime),
			<span onClick={ () => { setEditUserPlaceHolder(item); setIsShow(true); } } className='cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline'>Edit</span>
		])
	}
	return <>
		<ReusableTable { ...props } />
		{ isShow && <Modal data={ editUserPlaceHolder } closeModal={ () => setIsShow(false) } mutate={ mutate } /> }
	</>
}


type ModalProps = {
	closeModal: Function
	data: UserSecure | undefined
	mutate?: KeyedMutator<UserSecure[]>
}
const Modal = ({ closeModal, data, ...props }: ModalProps) => {
	const [isDuringSave, setIsDuringSave] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)
	const css = useMemo(() => ({
		input: `
		shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
		focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 
		dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
		dark:focus:border-blue-500`,
		'input.disabled': `disabled:cursor-not-allowed dark:disabled:dark:text-gray-400 disabled:text-gray-400
		read-only:cursor-not-allowed dark:read-only:dark:text-gray-400 read-only:text-gray-400`
	}), [])

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		try {
			setIsDuringSave(true)
			const form = new FormData(event.target as HTMLFormElement)
			const payload = Object.fromEntries(form.entries())
			console.log(payload)
			props.mutate && await props.mutate<UserSecure[]>(async (cache) => {
				if (!cache) return cache
				const req = await fetch('/api/users/role', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				})
				if (req.status !== 200) throw new Error(req.statusText, { cause: req.statusText })
				const res = await req.json() as UserSecure
				const edit = cache.map(m => {
					if (m.id !== res.id) return m
					return res
				})
				return edit
			}, {
				revalidate: false,
				rollbackOnError: true
			})

			toast.success('Success')
			closeModal()
		} catch (e: any) {
			toast.error(`Error${e?.cause ? `: ${e.cause}` : ''}`)
		} finally {
			setIsDuringSave(false)
		}
	}
	return (
		<div id="editUserModal" tabIndex={ -1 } aria-hidden="true" className=" fixed top-0 left-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] max-h-full">
			<div className="relative w-full max-w-2xl max-h-full mx-auto ">
				{/* <!-- Modal content --> */ }
				<form onSubmit={ submitForm } ref={ formRef } className="relative bg-white rounded-lg shadow dark:bg-gray-700">
					{/* <!-- Modal header --> */ }
					<div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
							Edit user
						</h3>
						<button type="button" onClick={ () => closeModal() } className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="editUserModal">
							<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
							</svg>
							<span className="sr-only">Close modal</span>
						</button>
					</div>
					{/* <!-- Modal body --> */ }
					<div className="p-6 space-y-6">
						<div className="grid grid-cols-6 gap-6">
							<div className="col-span-6 sm:col-span-3">
								<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">UID</label>
								<input type="text" defaultValue={ data?.id } readOnly name="uid" id="uid" className={ `${css.input} ${css["input.disabled"]}` } required />
							</div>
							<div className="col-span-6 sm:col-span-3">
								<label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Display Name</label>
								<input type="text" defaultValue={ data?.name ?? '' } placeholder="N/A" name="name" className={ `${css.input}` } />
							</div>
							<div className="col-span-6 sm:col-span-3">
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
								<input type="email" defaultValue={ data?.email ?? "N/A" } disabled name="email" id="email" className={ `${css.input} ${css["input.disabled"]}` } required />
							</div>
							<div className="col-span-6 sm:col-span-3">
								<label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
								<select id="role" name="role" className={ `${css.input} ` } required>
									<option disabled selected >Choose a role</option>
									<option disabled selected={ data?.role === 'ROOT' } value="ROOT">ผู้ดูแลระบบ</option>
									<option disabled={ data?.role === 'ROOT' } selected={ data?.role === 'ADMIN' } value="ADMIN">ผู้จัดการกิจกรรม</option>
									<option disabled={ data?.role === 'ROOT' } selected={ data?.role === 'USER' } value="USER">ผู้ใช้งานทั่วไป</option>
								</select>
							</div>
						</div>
					</div>
					{/* <!-- Modal footer --> */ }
					<div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
						{ isDuringSave ? <ButtonLoading /> : <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
							Save
						</button> }
					</div>
				</form>
			</div>
		</div>
	)
}


Page.defaultLayout = 'BACK_OFFICE'

export default Page
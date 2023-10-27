import Loading from "@/components/Loading"
import { useSession } from "next-auth/react"
import React, { useMemo, useRef, useState } from "react"
import { UserCurcle } from '@/components/svg'
import { Session } from "next-auth"
import ButtonLoading from "@/components/ButtonLoading"
import { uploadToDiscord } from "@/utils/uploadImage"
import Head from "next/head"
const Profile = () => {
	const [showEditModal, setShowEditModal] = useState(false)
	const css = useMemo(() => ({
		label: 'block text-gray-700 dark:text-gray-400'
	}), [])
	const { data: session, status } = useSession()
	if (status === 'unauthenticated')
		return 'Signin'
	if (!session)
		return <Loading className="mt-2" />
	return (
		<div className='container mx-auto mt-4'>
			<Head>
				<title>{`My Profile`}</title>
			</Head>
			{ session.user.image
				? <img className="mx-auto text-center w-36 h-36 rounded-full" src={ session.user.image }></img>
				: <UserCurcle className="mx-auto w-36 h-36" /> }
			<div className="text-center mt-4">
				<label className={ css.label } >UID</label>
				<span>{ session.user.id }</span>
			</div>

			<div className="text-center mt-2">
				<label className={ css.label } >Email</label>
				<span>{ session.user.email }</span>
			</div>

			<div className="text-center mt-2">
				<label className={ css.label } >Display Name</label>
				<span>{ session.user.name || "<Unset>"}</span>
			</div>


			<div className="text-center mt-6">
				<button onClick={ e => setShowEditModal(true) } type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
					แก้ไข
				</button>
			</div>

			{ showEditModal && <EditModal closeModal={ () => setShowEditModal(false) } /> }


		</div>
	)
}



const ChangeAvatar2 = (props: { defaultImage: string | null }) => {
	const fileInput = useRef<HTMLInputElement>(null)
	return (

		<label className="relative group inline-block cursor-pointer rounded-full">
			<div className="bg-black rounded-full">
				<img className="group-hover:opacity-50 rounded-full w-36 h-36 " src={ props.defaultImage! } />
			</div>
			<div className="opacity-20  group-hover:opacity-100 absolute inset-0 flex justify-center items-center flex-col">
				<span className="block">Change</span>
				<span className="block">Avatar</span>
			</div>
			<input ref={ fileInput } type="file" className="hidden" />
		</label>

	)
}

const ChangeAvatar = React.forwardRef<HTMLInputElement, { defaultImage: string | null }>((props, ref) => {
	// const fileInput = useRef<HTMLInputElement>(null)
	const [image, setImage] = useState<string>()
	const [overLimit, setOverLimit] = useState(false)
	const limitFileSize = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			if (e.target.files[0].size > 1 * 1024 * 1024) {
				console.log("File with maximum size of 1MB is allowed")
				e.target.value = ''
				setOverLimit(true)
				return false
			}
			setOverLimit(false)
			// setImage(e.target.files[0])
			image && URL.revokeObjectURL(image)
			setImage(URL.createObjectURL(e.target.files[0]))
		}
	}
	return (
		<div>
			<label className="relative group inline-block cursor-pointer rounded-full">
				<div className="group-hover:bg-black rounded-full">
					{ image
						? <img className="group-hover:opacity-50 rounded-full w-36 h-36" src={ image } />
						: props.defaultImage
							? <img className="group-hover:opacity-50 rounded-full w-36 h-36" src={ props.defaultImage } />
							: <UserCurcle className="group-hover:opacity-50 rounded-full w-36 h-36" /> }

				</div>
				<div className="opacity-20  group-hover:opacity-100 absolute inset-0 flex justify-center items-center flex-col">
					<span className="block">Change</span>
					<span className="block">Avatar</span>
				</div>
				<input ref={ ref } onChange={ limitFileSize } accept="image/*" name="avatar" type="file" className="hidden" />
			</label>
			{ overLimit && <p className="text-red-500">File with maximum size of 1MB is allowed</p> }
		</div>

	)
})

type ModalProps = {
	closeModal: Function
}
const EditModal = ({ closeModal }: ModalProps) => {
	const { data, update } = useSession()
	const [isDuringSave, setIsDuringSave] = useState(false)
	const session = data as Session
	const formRef = useRef<HTMLFormElement>(null)
	const fileRef = useRef<HTMLInputElement>(null)
	const css = useMemo(() => ({
		input: `
		shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
		focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 
		dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
		dark:focus:border-blue-500`,
		'input.disabled': `disabled:cursor-not-allowed dark:disabled:dark:text-gray-400 disabled:text-gray-400
		read-only:cursor-not-allowed dark:read-only:dark:text-gray-400 read-only:text-gray-400`
	}), [])

	const saveProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		if (formRef.current) {
			const formData = new FormData(formRef.current)
			const name = formData.get('name')
			if (fileRef.current && fileRef.current.files && fileRef.current.files[0]) {
				if (fileRef.current.files[0].size > 1 * 1024 * 1024) {
					// 1 MB
					return
				}
				const imageURL = await uploadToDiscord(fileRef.current.files[0])
				const u = await update({
					name: name,
					image: imageURL
				})
				if (u) {
					closeModal()
				}
			} else {
				const u = await update({ name })
				if (u) {
					closeModal()
				}
			}
		}
	}

	return (
		<div id="editUserModal" tabIndex={ -1 } aria-hidden="true" className=" fixed top-0 left-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] max-h-full">
			<div className="relative w-full max-w-2xl max-h-full mx-auto ">
				{/* <!-- Modal content --> */ }
				<form ref={ formRef } className="relative bg-white rounded-lg shadow dark:bg-gray-700">
					{/* <!-- Modal header --> */ }
					<div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
							Edit Profile
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
							<div className="col-span-6 text-center">
								{ <ChangeAvatar ref={ fileRef } defaultImage={ session.user.image } /> }
								{/* { session.user.image
									? <img className="mx-auto text-center w-36 h-36 rounded-full" src={ session.user.image }></img>
									: <UserCurcle className="mx-auto w-36 h-36" /> } */}
							</div>
							<div className="col-span-6">
								<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">UID</label>
								<input type="text" defaultValue={ session?.user.id } readOnly disabled name="uid" id="uid" className={ `${css.input} ${css["input.disabled"]}` } required />
							</div>
							<div className="col-span-6">
								<label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
								<input type="text" defaultValue={ session?.user.email ?? '' } disabled placeholder="N/A" name="email" className={ `${css.input} ${css["input.disabled"]}` } />
							</div>
							<div className="col-span-6">
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Display Name</label>
								<input defaultValue={ session?.user.name ?? '' } name="name" className={ `${css.input}` } required />
							</div>
						</div>
					</div>
					{/* <!-- Modal footer --> */ }
					<div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
						{ isDuringSave
							? <ButtonLoading />
							: <button onClick={ saveProfile } type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
								Save
							</button> }
						{/* <button type="submit" onClick={ e => update() }>Update</button> */}
					</div>
				</form>
			</div>
		</div>
	)
}

export default Profile
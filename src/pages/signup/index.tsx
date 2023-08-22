
import Link from 'next/link'
import type { NextPageWithLayout } from '@/pages/_app'
import { onInput } from '@/utils'
import { useCallback, useRef, useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'
import { useRouter } from 'next/router'


const Page: NextPageWithLayout = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [flashMessage, setFlashMessage] = useState<string>()
	const passwordRef = useRef<HTMLInputElement>(null)
	const router = useRouter()


	const submit = async <T1 extends HTMLElement>(e: FormEvent<T1>) => {
		e.preventDefault()
		try {
			//
			// const passwordValidate = <T extends HTMLInputElement>(input: React.ChangeEvent<T>) => {
			// 	const { value, name } = input.target
			// 	if (name === 'password') setPassword(value)
			// 	if (name === 'confirm-password') setConfirmPassword(value)
			// 	// 
			if (password !== confirmPassword) {
				passwordRef.current?.setCustomValidity('Password not match.')
				passwordRef.current?.reportValidity()
				return
			}
			const req = await fetch('/api/users/create', {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email, password
				})
			})
			if (req.status !== 200) return toast.error('Error')
			const res = await req.json()
			if (res.success === true) {
				toast.success(<>Create Success.<br />Redirect in 5 seconds</>, {
					onClose: () => { router.replace('/signin') }
				})
				return
			}
			toast.error(`Error: ${res.message}`)
		} catch (e) {
			toast.error(`Error, ${e}`)
		}

	}

	return (
		// <div className='container  pb-4 '>
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<Link href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
					<img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
					Flowbite
				</Link>
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
							Create and account
						</h1>
						<form className="space-y-4 md:space-y-6" onSubmit={ submit }>
							<div>
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
								<input value={ email } onChange={ e => setEmail(e.target.value) } type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required />
							</div>
							<div>
								<label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
								<input
									value={ password }
									onChange={ e => setPassword(e.target.value) }
									minLength={ 6 }
									type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
							</div>
							<div>
								<label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
								<input
									ref={ passwordRef }
									value={ confirmPassword }
									onInput={ onInput }
									onChange={ e => setConfirmPassword(e.target.value) }
									minLength={ 6 }
									type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
							</div>
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required />
								</div>
								<div className="ml-3 text-sm">
									<label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">I accept the
										<Link className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#"> Terms and Conditions</Link>
									</label>
								</div>
							</div>
							<button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>
							<p className="text-sm font-light text-gray-500 dark:text-gray-400">
								Already have an account?
								<Link href="/signin" className="font-medium text-primary-600 hover:underline dark:text-primary-500"> Login here</Link>
							</p>
							{
								flashMessage &&
								<div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
									<svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
									</svg>
									<span className="sr-only">Info</span>
									<div>
										<span className="font-medium">Error:</span> { flashMessage }
									</div>
								</div>
							}
						</form>
					</div>
				</div>
			</div>
		</section>
		// </div>
	)
}
// override header to null
Page.getLayout = function getLayout(page) {
	return page
}

export default Page
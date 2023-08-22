import { Session } from 'next-auth';
import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import CustomToastContainer from '../toast';


type LayoutProps = {
	children: React.ReactNode,
};

const Layout = (props: LayoutProps) => {
	// console.log('layout')
	// console.log(props)
	// console.log()
	// const Head = React.useCallback(Header, [])

	// return <div>{children}</div>;
	// const { data: session, status } = useSession()
	// if (session) {

	// }
	return (
		<>
			{/* {Header} */ }
			<Header />
			<main>{ props.children }</main>
			< CustomToastContainer />
			{/* {status === 'authenticated' ? Auth(session) : noAuth()}
			{children}
			<h2>Footer2</h2> */}
		</>
	)

	// <>
	// 		<h2>Header2</h2>
	// 		<button onClick={() => signIn()}>Sign in</button>
	// 		<div>{children}</div>
	// 		<h2>Footer2</h2>
	// 	</>
}


// https://react.dev/reference/react/PureComponent#alternatives
const Header = React.memo(function Header() {
	const { data: session, status } = useSession()
	const { pathname } = useRouter()

	const css = React.useMemo(() => ({
		link: 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent',
		'link.active': 'block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent',

	}), [])

	return (
		<nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
			<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
				<Link href="/" className="flex items-center">
					<img src="https://flowbite.com/docs/images/logo.svg" className="h-8 mr-3" alt="Flowbite Logo" />
					<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
				</Link>
				<button data-collapse-toggle="navbar-dropdown" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-dropdown" aria-expanded="false">
					<span className="sr-only">Open main menu</span>
					<svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
				</button>
				<div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
					<ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
						<li>
							<Link href="/admin" className={ pathname === '/admin' ? css['link.active'] : css.link } aria-current="page">
								หน้าแรก
							</Link>
						</li>
						{
							session?.role === 'ROOT' 
							? <li>
							<Link href="/admin/news" className={ pathname.startsWith('/admin/news') ? css['link.active'] : css.link } >
								ข่าว
							</Link>
						</li>
						: undefined
						}
						<li>
							<Link href="/admin/event" className={ pathname.startsWith('/admin/event') ? css['link.active'] : css.link } >
								กิจกรรม
							</Link>
						</li>
						{
							session?.role === 'ROOT'
								? <li>
									<Link href="/admin/users" className={ pathname.startsWith('/admin/users') ? css['link.active'] : css.link } >
										ผู้ใช้งาน
									</Link>
								</li>
								: undefined
						}
						<li>
							{
								status === 'authenticated'
									? <div id="dropdownNavbar" className={ `group relative font-normal break-words` }>
										<button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar" className="flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
											{/* IMG */ }
											{ session?.user?.name ?? 'email: N/A' }
											<svg className="w-5 h-5 ml-1" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
												<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
											</svg>
										</button>

										<ul
											className={ `group-hover:block animate-dropdown absolute right-0 z-10 pt-4 py-2 dark:border-gray-700 w-32 xl:w-40 rounded-lg hidden text-sm text-gray-700 dark:text-gray-400` } >
											<li className='dark:border-gray-700 pt-2 border-t border-x rounded-t-lg bg-white dark:bg-gray-900'>
												<Link href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</Link>
											</li>
											<li className='dark:border-gray-700 border-x bg-white dark:bg-gray-900'>
												<Link href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</Link>
											</li>
											{
												session?.role === 'ROOT' && (
													<li className='dark:border-gray-700 border-x bg-white dark:bg-gray-900'>
														<hr className=' h-px bg-gray-200 border-0 dark:bg-gray-700' />
														<Link href="/admin/tba" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
															TBA
														</Link>
													</li>
												)
											}
											<hr className=' h-px bg-gray-200 border-0 dark:bg-gray-700' />
											<li className='dark:border-gray-700 pb-1 border-x border-b rounded-b-lg bg-white dark:bg-gray-900'>
												<button onClick={ () => signOut() } className='text-left w-full block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>SignOut</button>
											</li>
										</ul>
									</div>
									: <Link href="/api/auth/signin" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">SignIn</Link>
							}
						</li>
					</ul>
				</div>
			</div>
		</nav>
	)
})


export default Layout
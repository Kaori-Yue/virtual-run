import { useTheme } from 'next-themes';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';

export default function CustomToastContainer() {
	const { resolvedTheme } = useTheme()
	return <ToastContainer
		position="bottom-right"
		autoClose={ 5000 }
		// hideProgressBar={ true }
		newestOnTop={ false }
		closeOnClick
		rtl={ false }
		pauseOnFocusLoss
		draggable
		pauseOnHover
		theme= { resolvedTheme as any }
		// theme={ theme as ('dark' | 'light' | 'system') as any || 'dark' }
	/>
}
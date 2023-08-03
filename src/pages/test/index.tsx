
import type { ReactElement } from 'react'
// import Layout from '@/components/layout'
import Header from '@/components/header'
// import NestedLayout from '@/components/layout/index'
// import type { NextPageWithLayout } from '@/pages/_app'

// const Page: NextPageWithLayout = () => {
//   return <p>hello world</p>
// }

export default function Page() {
	return (
		<p className='text-blue-500 bg-rose-300'>test page</p>
	)
  }

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <Header>
		{page}
      {/* <NestedLayout>{page}</NestedLayout> */}
    </Header>
  )
}

// export default Page

import type { ReactElement } from 'react'
// import Layout from '@/components/layout'
// import Header from '@/components/header'
// import NestedLayout from '@/components/layout/index'
// import type { NextPageWithLayout } from '@/pages/_app'
import Card from '@/components/card'

// const Page: NextPageWithLayout = () => {
//   return <p>hello world</p>
// }

export default function Page() {
	return (
		<Card imageURL='https://flowbite.com/docs/images/blog/image-1.jpg' title='test title' subTitle='test subtitle' />
	)
  }


Page.getLayout = function getLayout(page: ReactElement) {
  return page
}

// export default Page

type LayoutProps = {
	children: React.ReactNode,
  };

export default function Layout({ children }: LayoutProps) {
	// return <div>{children}</div>;
	return (
		<>
		<h2>Header3</h2>
		<div>{children}</div>
		<h2>Footer3</h2>
		</>
	)
  }
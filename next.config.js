/** @type {import('next').NextConfig} */
const nextConfig = {
	//   reactStrictMode: false,
	images: {
		unoptimized: true,
		domains: [
			'picsum.photos'
		]
	},
	experimental: {
		swcPlugins: [
			['next-superjson-plugin', {excluded: [],}],
		]
	}
}

module.exports = nextConfig

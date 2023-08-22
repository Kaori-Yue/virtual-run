import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Middleware } from "swr";

// https://github.com/vercel/next.js/discussions/11484#discussioncomment-1916158
// when use swr with router.query, during hydration will return {}
export const awaitRouterMiddleware: Middleware = (useSWRNext) => {
	return (key, fetcher, config) => {
		const router = useRouter();
		const [ready, setReady] = useState(false)
		useEffect(() => {
			if (router.isReady) setReady(true)
		}, [router.isReady])

		const swr = useSWRNext(ready ? key : null, fetcher, config);
		return swr;
	};
};
export async function uploadToDiscord(image: File): Promise<string> {
	// throw new Error("Fetch error", {
	// 	cause: 'upload to discord error'
	// });
	
	const ENDPOINT = `https://discord.com/api/webhooks/1124220458825420910/iInVKmF2ISUQBc6p5mrRWa-T1yprxpYWeBttUzMy2u9jNeodqbxbyQLYIXzlf0xhMluG`
	const payload = new FormData()
	payload.append("image1", image)
	payload.append(
		"payload_json",
		JSON.stringify({
			content: `filename: ${image.name}\nfilesize: ${image.size} bytes | ${image.size / 1024 / 1024} Mb`,
		})
	)
	const req = await fetch(ENDPOINT, {
		method: "POST",
		body: payload,
	})
	console.log(req)
	const res = await req.json()
	console.log(res)
	return res.attachments[0].url // | proxy_url
}

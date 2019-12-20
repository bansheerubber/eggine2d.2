export default function sleep(seconds: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, seconds)
	})
}
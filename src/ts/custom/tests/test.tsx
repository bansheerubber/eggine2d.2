export default function test(name: string, func: () => void) {
	try {
		func()
	}
	catch(error) {
		console.error(`Fail for ${name}`, error)
	}
}
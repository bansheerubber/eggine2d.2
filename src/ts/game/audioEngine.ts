import sleep from "../helpers/sleep";

// util class that plays audio
export default class AudioEngine {
	public static mp3Duration: any
	
	public static initServerSideAudio(): void {
		this.mp3Duration = require('mp3-duration');
	}
	
	public static async getLengthOfMP3(fileName: string): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.mp3Duration(fileName, (error, duration) => {
				if(error) {
					reject(error)
				}
				else {
					resolve(duration)
				}
			})
		})
	}

	// waits the duration of a mp3, so we can sync up server elements to the client
	public static async waitForMP3(fileName: string): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let length = await this.getLengthOfMP3(fileName)
			await sleep(length * 1000)
			resolve()
		})
	}

	// plays an mp3 on the client
	public static playMP3(address: string): void {
		let audio = document.getElementById("audio") as HTMLAudioElement
		audio.pause()
		audio.src = address
		audio.play()
	}
}
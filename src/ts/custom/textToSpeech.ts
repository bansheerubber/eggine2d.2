import * as fs from "fs"
import * as util from "util"

// handles making all the required text to speech files
export default class TextToSpeech {
	public static client
	public static audioOutput = "/home/me/Projects/tscode/mafia/build/client/audio/"
	
	public static createTextToSpeechAPI(): void {
		function eggquire(input) {
			return require(input)
		}
		
		const textToSpeech = eggquire('@google-cloud/text-to-speech');
		this.client = new textToSpeech.TextToSpeechClient()
	}

	public static textToFileName(text: string): string {
		return text.replace("<speak>", "").replace(/[^\w]/g, "").match(/\w{1,60}/)[0] + ".mp3"
	}

	public static saveToMP3(text: string): string {
		// get the first bit of text for a filename
		let fileName = this.textToFileName(text)
		if(!fs.existsSync(this.audioOutput + fileName)) {
			(async () => {
				let request = {
					input: {
						ssml: text,
					},
					// Select the language and SSML Voice Gender (optional)
					voice: {
						languageCode: "en-US",
						name: "en-GB-Wavenet-D",
						ssmlGender: "MALE",
					},
					// Select the type of audio encoding
					audioConfig: {
						audioEncoding: "MP3",
					},
				}
	
				const [response] = await this.client.synthesizeSpeech(request);
				// Write the binary audio content to a local file
				const writeFile = util.promisify(fs.writeFile);
				await writeFile(this.audioOutput + fileName, response.audioContent, "binary");
				console.log(`${fileName} created.`)
			})()
		}
		else {
			console.log(`Found file ${fileName}.`)
		}
		return this.audioOutput + fileName
	}
}
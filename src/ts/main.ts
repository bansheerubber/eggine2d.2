import * as fs from "fs"
// handle reading .vert/.frag files on server side
if(typeof window == "undefined") {
	require.extensions[".vert"] = function (module, filename) {
		module.exports = fs.readFileSync(filename, 'utf8')
	}
	
	require.extensions[".frag"] = function (module, filename) {
		module.exports = fs.readFileSync(filename, 'utf8')
	}
}

import Game from "./game/game";
import main from "./custom/main";
import Vector from "./helpers/vector";
import VectorInterpolation, { SmoothVectorInterpolation } from "./helpers/vectorInterpolation";
import ScalarInterpolation, { SmoothScalarInterpolation } from "./helpers/scalarInterpolation";
import TestRemoteObject from "./custom/testRemoteObject";
import ShadowLight from "./render/lights/shadowLight";

(async function() {
	let game = new Game(typeof window != "undefined")
	game.start()

	/* deconversion process:
		- read through object JSON and deconvert all properties/remote objects
		- go through all previously created remote objects and assign their correct properties to every single one of their references
		- once all remote objects have been deconverted, go through all of them in their order of creation and reconstruct them
			- use ::createRemoteClass to assist with this, which allows the reconstruction of remote objects inside other remote object's constructors
			- only ::reconstructor is called, constructor is not called during this process
		- once reconstructed, we are finished
	*/
	
	main(game)
	
	if(game.isClient) {
		window["game"] = game
		window["Vector"] = Vector
		window["VectorInterpolation"] = VectorInterpolation
		window["SmoothVectorInterpolation"] = SmoothVectorInterpolation
		window["ScalarInterpolation"] = ScalarInterpolation
		window["SmoothScalarInterpolation"] = SmoothScalarInterpolation
		window["ShadowLight"] = ShadowLight

		window["test"] = async function(object1: TestRemoteObject, object2: TestRemoteObject) {
			object1.serverTest(25, "frog", object2)
				
			try {
				let value = await object1.getRemoteReturn()
				console.log(value, "egg")
			}
			catch(error) {
				console.log(error)
			}
		}
	}
})()

/*
try {
	(this.game.network as ServerNetwork).getLastRemoteReturns().promise.then((value: ServerResolve[]) => {
		console.log(value)
	})
}
catch(error) {
	console.log(error)
}
*/
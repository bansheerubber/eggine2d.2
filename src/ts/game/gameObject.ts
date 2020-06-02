import Game from "./game";
import GameObjectOptions from "./gameObjectOptions";
import { Frames, ScheduleObject } from "./scheduler";

// everything that needs to tick inherits from this object
export default abstract class GameObject {
	public game: Game
	public gameObjectOptions: GameObjectOptions
	public isDestroyed: boolean = false



	constructor(game: Game, gameObjectOptions: GameObjectOptions = {}) {
		this.game = game
		game.ticker.objects.add(this)
		this.gameObjectOptions = gameObjectOptions
	}
	
	// called every frame, deltaTime is in seconds
	public tick(deltaTime: number) {
		
	}

	// schedule a call with Scheduler
	public schedule(time: number | Frames, call: Function, ...args: any[]): ScheduleObject {
		return this.game.ticker.scheduler.schedule(time, call, args, this)
	}

	public get canTick() {
		return this.gameObjectOptions.canTick == undefined ? true : this.gameObjectOptions.canTick
	}

	public destroy(): void {
		this.game.ticker.objects.delete(this)
		this.isDestroyed = true
	}
}
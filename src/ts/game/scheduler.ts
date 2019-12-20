import GameObject from "./gameObject";
import Game from "./game";
import { performance } from "perf_hooks"
import { promises } from "fs";

export class ScheduleObject {
	public call: Function // the function we want to call
	public owner: {} = undefined // the object that the function is being called on, if there even is one
	public args: any[] = [] // the arguments we want to apply to our function
	public creationTime: number // the time this schedule object was created
	public time: number = 0 // the number of miliseconds we wait until we execute this schedule object. if 0, then we do not pay attention to this
	public frames: number = 0 // the number of frames we wait until we execute this schedule object. if 0, then we do not pay attention to this
	public elapsedFrames: number = 0 // the number of frames that have elapsed since the time of creaiton

	private resolve: Function
	private promise: Promise<void> = new Promise<void>((resolve, reject) => { // promise that will be resolved when we execute our call
		this.resolve = resolve
	}) 
	private scheduler: Scheduler

	constructor(scheduler: Scheduler, owner: {}, call: Function, args: any[], time: number | Frames) {
		if(time instanceof Frames) {
			this.frames = time.frames
		}
		else {
			this.time = time
		}

		this.owner = owner
		this.call = call

		this.creationTime = performance.now()

		this.scheduler = scheduler
	}

	// returns true if we execute the call, false if we didn't
	public tick(): boolean {
		this.elapsedFrames++

		if(this.elapsedFrames >= this.frames && this.frames > 0) {
			this.execute()
			return true
		}
		else if(performance.now() - this.creationTime > this.time && this.time > 0) {
			this.execute()
			return true
		}
		else {
			return false
		}
	}

	public execute(): void {
		this.resolve(this.call.apply(this.owner, this.args))
	}

	// when this is finished, the promise will be resolved with the return value of our call
	public async finished(): Promise<any> {
		return this.promise
	}

	// returns true if we're still pending
	public isPending(): boolean {
		return this.scheduler.isPending(this)
	}

	// cancels us
	public cancel(): void {
		return this.scheduler.cancel(this)
	}
}

// represents how many frames we wait until we execute a schedule object
export class Frames {
	public frames: number

	constructor(frames: number) {
		this.frames = frames
	}
}

export default class Scheduler {
	public scheduleObjects: ScheduleObject[] = []
	public static activeScheduler: Scheduler
	
	constructor() {
		Scheduler.activeScheduler = this
	}

	public tick(): void {
		for(let i = this.scheduleObjects.length - 1; i >= 0; i--) {
			if(this.scheduleObjects[i].tick()) {
				this.remove(this.scheduleObjects[i])
			}
		}
	}

	public schedule(call: Function, args: any[], time: number | Frames, owner?: {}): ScheduleObject {
		let scheduleObject = new ScheduleObject(this, owner, call, args, time)
		this.scheduleObjects.push(scheduleObject)
		return scheduleObject
	}

	public static schedule(time: number | Frames, call: Function, ...args: any[]): ScheduleObject {
		let scheduleObject = new ScheduleObject(this.activeScheduler, undefined, call, args, time)
		this.activeScheduler.scheduleObjects.push(scheduleObject)
		return scheduleObject
	}

	// removes the schedule object from our array
	public cancel(scheduleObject: ScheduleObject): void {
		if(this.isPending(scheduleObject)) {
			this.remove(scheduleObject)
		}
	}

	// if the input schedule object is pending, then we return true. if not, then false
	public isPending(scheduleObject: ScheduleObject): boolean {
		return this.scheduleObjects.indexOf(scheduleObject) != -1
	}

	// removes a schedule object from our array
	private remove(scheduleObject: ScheduleObject): void {
		this.scheduleObjects.splice(this.scheduleObjects.indexOf(scheduleObject), 1)
	}
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
class ScheduleObject {
    constructor(scheduler, owner, call, args, time) {
        this.owner = undefined; // the object that the function is being called on, if there even is one
        this.args = []; // the arguments we want to apply to our function
        this.time = 0; // the number of miliseconds we wait until we execute this schedule object. if 0, then we do not pay attention to this
        this.frames = 0; // the number of frames we wait until we execute this schedule object. if 0, then we do not pay attention to this
        this.elapsedFrames = 0; // the number of frames that have elapsed since the time of creaiton
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
        });
        if (time instanceof Frames) {
            this.frames = time.frames;
        }
        else {
            this.time = time;
        }
        this.owner = owner;
        this.call = call;
        this.creationTime = perf_hooks_1.performance.now();
        this.scheduler = scheduler;
    }
    // returns true if we execute the call, false if we didn't
    tick() {
        this.elapsedFrames++;
        if (this.elapsedFrames >= this.frames && this.frames > 0) {
            this.execute();
            return true;
        }
        else if (perf_hooks_1.performance.now() - this.creationTime > this.time && this.time > 0) {
            this.execute();
            return true;
        }
        else {
            return false;
        }
    }
    execute() {
        this.resolve(this.call.apply(this.owner, this.args));
    }
    // when this is finished, the promise will be resolved with the return value of our call
    async finished() {
        return this.promise;
    }
    // returns true if we're still pending
    isPending() {
        return this.scheduler.isPending(this);
    }
    // cancels us
    cancel() {
        return this.scheduler.cancel(this);
    }
}
exports.ScheduleObject = ScheduleObject;
// represents how many frames we wait until we execute a schedule object
class Frames {
    constructor(frames) {
        this.frames = frames;
    }
}
exports.Frames = Frames;
class Scheduler {
    constructor() {
        this.scheduleObjects = [];
        Scheduler.activeScheduler = this;
    }
    tick() {
        for (let i = this.scheduleObjects.length - 1; i >= 0; i--) {
            if (this.scheduleObjects[i].tick()) {
                this.remove(this.scheduleObjects[i]);
            }
        }
    }
    schedule(call, args, time, owner) {
        let scheduleObject = new ScheduleObject(this, owner, call, args, time);
        this.scheduleObjects.push(scheduleObject);
        return scheduleObject;
    }
    static schedule(time, call, ...args) {
        let scheduleObject = new ScheduleObject(this.activeScheduler, undefined, call, args, time);
        this.activeScheduler.scheduleObjects.push(scheduleObject);
        return scheduleObject;
    }
    // removes the schedule object from our array
    cancel(scheduleObject) {
        if (this.isPending(scheduleObject)) {
            this.remove(scheduleObject);
        }
    }
    // if the input schedule object is pending, then we return true. if not, then false
    isPending(scheduleObject) {
        return this.scheduleObjects.indexOf(scheduleObject) != -1;
    }
    // removes a schedule object from our array
    remove(scheduleObject) {
        this.scheduleObjects.splice(this.scheduleObjects.indexOf(scheduleObject), 1);
    }
}
exports.default = Scheduler;
//# sourceMappingURL=scheduler.js.map
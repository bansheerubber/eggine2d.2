"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Matter = require("matter-js");
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    // add the input vector to this one
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    // subtract the input vector from this one
    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    // multiply a scalar to this vector
    mul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    // get the unit vector of this vector
    unit() {
        let length = this.length();
        if (length != 0) {
            this.x /= length;
            this.y /= length;
            return this;
        }
        else {
            this.x = 0;
            this.y = 0;
            return this;
        }
    }
    // get the vector to the right of this vector
    right() {
        let tempX = this.x;
        let tempY = this.y;
        this.x = tempY;
        this.y = -tempX;
        return this;
    }
    add_(vector) {
        return this.clone().add(vector);
    }
    sub_(vector) {
        return this.clone().sub(vector);
    }
    mul_(scalar) {
        return this.clone().mul(scalar);
    }
    unit_() {
        return this.clone().unit();
    }
    right_() {
        return this.clone().right();
    }
    copy(input) {
        this.x = input.x;
        this.y = input.y;
        return this;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    // get the dot product with this vector and the input vector
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    // get the vector perpendicular to this one
    perp() {
        return new Vector(this.y, -this.x);
    }
    // get the length of this vector
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    // get the distance from vector to the other
    dist(input) {
        return Math.sqrt(((this.x - input.x) ** 2) + ((this.y - input.y) ** 2));
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    static getIntersectionPoint(point1, direction1, point2, direction2) {
        let output = new Vector();
        let end1 = point1.add_(direction1);
        let end2 = point2.add_(direction2);
        // slopes
        let slope1 = (end1.y - point1.y) / (end1.x - point1.x);
        let slope2 = (end2.y - point2.y) / (end2.x - point2.x);
        // y intercepts
        let intercept1 = point1.y - slope1 * point1.x;
        let intercept2 = point2.y - slope2 * point2.x;
        let finalX = (intercept2 - intercept1) / (slope1 - slope2);
        let finalY = slope1 * finalX + intercept1;
        return output.set(finalX, finalY);
    }
    // converts this to a MatterJS vector
    toMatter() {
        if (!this.matterVector) {
            this.matterVector = Matter.Vector.create(this.x, this.y);
        }
        this.matterVector.x = this.x;
        this.matterVector.y = this.y;
        return this.matterVector;
    }
    // turns a positive x,y coordinate into a unique, single number
    unique() {
        return ((this.x + this.y) * (this.x + this.y + 1)) / 2 + this.y;
    }
}
exports.default = Vector;
//# sourceMappingURL=vector.js.map
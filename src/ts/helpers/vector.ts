import Matter = require("matter-js");

type callback = (x: number, y: number) => void

export default class Vector {
	public x: number
	public y: number

	public onModified: callback

	private matterVector: Matter.Vector

	constructor(x: number = 0, y: number = 0) {
		this.x = x
		this.y = y
	}

	// add the input vector to this one
	public add(vector: Vector): Vector {
		this.x += vector.x
		this.y += vector.y
		return this
	}

	// subtract the input vector from this one
	public sub(vector: Vector): Vector {
		this.x -= vector.x
		this.y -= vector.y
		return this
	}

	// multiply a scalar to this vector
	public mul(scalar: number): Vector {
		this.x *= scalar
		this.y *= scalar
		return this
	}

	// get the unit vector of this vector
	public unit(): Vector {
		let length = this.length()

		if(length != 0) {
			this.x /= length
			this.y /= length
			return this
		}
		else {
			this.x = 0
			this.y = 0
			return this
		}
	}

	// get the vector to the right of this vector
	public right(): Vector {
		let tempX = this.x
		let tempY = this.y
		this.x = tempY
		this.y = -tempX
		return this
	}

	public add_(vector: Vector): Vector {
		return this.clone().add(vector)
	}

	public sub_(vector: Vector): Vector {
		return this.clone().sub(vector)
	}

	public mul_(scalar: number): Vector {
		return this.clone().mul(scalar)
	}

	public unit_(): Vector {
		return this.clone().unit()
	}

	public right_(): Vector {
		return this.clone().right()
	}

	public copy(input: Vector): Vector {
		this.x = input.x
		this.y = input.y
		return this
	}

	public clone(): Vector {
		return new Vector(this.x, this.y)
	}

	// get the dot product with this vector and the input vector
	public dot(vector: Vector): number {
		return this.x * vector.x + this.y * vector.y
	}

	// get the vector perpendicular to this one
	public perp(): Vector {
		return new Vector(this.y, -this.x)
	}

	// get the length of this vector
	public length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	// get the distance from vector to the other
	public dist(input: Vector): number {
		return Math.sqrt(((this.x - input.x) ** 2) + ((this.y - input.y) ** 2))
	}

	public set(x: number, y: number): Vector {
		this.x = x
		this.y = y
		return this
	}

	public static getIntersectionPoint(point1: Vector, direction1: Vector, point2: Vector, direction2: Vector): Vector {
		let output = new Vector()

		let end1 = point1.add_(direction1)
		let end2 = point2.add_(direction2)

		// slopes
		let slope1 = (end1.y - point1.y) / (end1.x - point1.x)
		let slope2 = (end2.y - point2.y) / (end2.x - point2.x)

		// y intercepts
		let intercept1 = point1.y - slope1 * point1.x
		let intercept2 = point2.y - slope2 * point2.x

		let finalX = (intercept2 - intercept1) / (slope1 - slope2)
		let finalY = slope1 * finalX + intercept1

		return output.set(finalX, finalY)
	}

	// converts this to a MatterJS vector
	public toMatter(): Matter.Vector {
		if(!this.matterVector) {
			this.matterVector = Matter.Vector.create(this.x, this.y)
		}
		
		this.matterVector.x = this.x
		this.matterVector.y = this.y

		return this.matterVector
	}
}
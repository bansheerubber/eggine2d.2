class Leaf {
	private _children: Leaf[] = []
	private _parent: Leaf

	private classReference: any

	constructor(classReference) {
		this.classReference = classReference
	}

	public getClassReference(): any {
		return this.classReference
	}

	public getChildren(): Leaf[] {
		return this._children
	}

	public addChild(child: Leaf): void {
		this._children.push(child)
		child.setParent(this)
	}

	public removeChild(child: Leaf): void {
		this._children.splice(this._children.indexOf(child), 1)
	}

	// sets the parent of this leaf
	public setParent(parent: Leaf): void {
		this._parent = parent
	}

	// gets the parent of this leaf
	public getParent(): Leaf {
		return this._parent
	}

	public* parents(): IterableIterator<Leaf> {
		let found: Leaf = this
		while((found = found.getParent()) != undefined) {
			yield found
		}
	}

	// gets all the children under this node
	public* children(): IterableIterator<Leaf> {
		// what the fuck is this code
		for(let leaf of this._children) {
			yield leaf

			// recursively yield the bullshit
			for(let leaf2 of leaf.children()) {
				yield leaf2
			}
		}
	}
}

export default class ExtensionTree {
	public static classMap: any = {} // addedClasses[string] = Leaf
	public static classes: any[] = []
	
	// adds an extended class to our extension tree
	public static addExtendedClass(parentClass: any, childClass: any): void {
		// if the child class already exists in the extension tree, then don't create a new leaf for it
		let childLeaf: Leaf
		if(this.classMap[childClass.name]) {
			childLeaf = this.classMap[childClass.name]
		}
		else {
			childLeaf = new Leaf(childClass)
		}

		// if the parent leaf already exists in the extension tree, then don't create a new leaf for it
		let parentLeaf: Leaf
		if(this.classMap[parentClass.name]) {
			parentLeaf = this.classMap[parentClass.name]
		}
		else {
			parentLeaf = new Leaf(parentClass)
		}

		parentLeaf.addChild(childLeaf)

		this.classMap[parentClass.name] = parentLeaf
		this.classMap[childClass.name] = childLeaf

		this.classes.push(parentClass)
		this.classes.push(childClass)
	}

	// finds the leaf based on the given class name
	public static getLeaf(inputClass: any): Leaf {
		return this.classMap[inputClass.name]
	}
}
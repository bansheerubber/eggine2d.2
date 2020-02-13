"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Leaf {
    constructor(classReference) {
        this._children = [];
        this.classReference = classReference;
    }
    getClassReference() {
        return this.classReference;
    }
    getChildren() {
        return this._children;
    }
    addChild(child) {
        this._children.push(child);
        child.setParent(this);
    }
    removeChild(child) {
        this._children.splice(this._children.indexOf(child), 1);
    }
    // sets the parent of this leaf
    setParent(parent) {
        this._parent = parent;
    }
    // gets the parent of this leaf
    getParent() {
        return this._parent;
    }
    *parents() {
        let found = this;
        while ((found = found.getParent()) != undefined) {
            yield found;
        }
    }
    // gets all the children under this node
    *children() {
        // what the fuck is this code
        for (let leaf of this._children) {
            yield leaf;
            // recursively yield the bullshit
            for (let leaf2 of leaf.children()) {
                yield leaf2;
            }
        }
    }
}
class ExtensionTree {
    // adds an extended class to our extension tree
    static addExtendedClass(parentClass, childClass) {
        // if the child class already exists in the extension tree, then don't create a new leaf for it
        let childLeaf;
        if (this.classMap[childClass.name]) {
            childLeaf = this.classMap[childClass.name];
        }
        else {
            childLeaf = new Leaf(childClass);
        }
        // if the parent leaf already exists in the extension tree, then don't create a new leaf for it
        let parentLeaf;
        if (this.classMap[parentClass.name]) {
            parentLeaf = this.classMap[parentClass.name];
        }
        else {
            parentLeaf = new Leaf(parentClass);
        }
        parentLeaf.addChild(childLeaf);
        this.classMap[parentClass.name] = parentLeaf;
        this.classMap[childClass.name] = childLeaf;
        this.classes.push(parentClass);
        this.classes.push(childClass);
    }
    // finds the leaf based on the given class name
    static getLeaf(inputClass) {
        return this.classMap[inputClass.name];
    }
}
ExtensionTree.classMap = {}; // addedClasses[string] = Leaf
ExtensionTree.classes = [];
exports.default = ExtensionTree;
//# sourceMappingURL=extensionTree.js.map
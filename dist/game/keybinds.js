"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Category {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}
class KeybindCategory extends Category {
    constructor() {
        super(...arguments);
        this.subCategories = [];
    }
}
exports.KeybindCategory = KeybindCategory;
class KeybindSubCategory extends Category {
    constructor(parent, name, description) {
        super(name, description);
        this.parent = parent;
    }
}
exports.KeybindSubCategory = KeybindSubCategory;
class Keybind {
    constructor(pressCallback, releaseCallback, key, modifier, name, description, category, subcategory) {
        this.name = "";
        this.description = "";
        this.key = "";
        this.modifierMask = 0;
        this.isPressed = false;
        KeybindController.initIndex(key, modifier);
        KeybindController.map[key][modifier].push(this);
        this.pressCallback = pressCallback;
        this.releaseCallback = releaseCallback;
        this.category = category;
        this.subcategory = subcategory;
        this.name = name;
        this.description = description;
        this.key = key;
        this.modifierMask = modifier;
    }
    onPress() {
        if (this.pressCallback && !this.isPressed) {
            this.pressCallback();
        }
        this.isPressed = true;
    }
    onRelease() {
        if (this.releaseCallback && this.isPressed) {
            this.releaseCallback();
        }
        this.isPressed = false;
    }
}
Keybind.None = 0;
Keybind.Shift = 0b001;
Keybind.Control = 0b010;
Keybind.Alt = 0b100;
exports.Keybind = Keybind;
class KeybindController {
    static initIndex(key, modifier) {
        if (!this.map[key]) {
            this.map[key] = {};
        }
        if (!this.map[key][modifier]) {
            this.map[key][modifier] = [];
        }
    }
    static onPress(event) {
        // get the key info if we're a keyboard event
        if (event instanceof KeyboardEvent) {
            var hitKey = event.key.toLowerCase();
            var modifierMask = event.altKey << 2 | event.ctrlKey << 1 | event.shiftKey;
        }
        // get the mouse info if we're a mouse event
        else {
            var hitKey = `mouse${event.button}`;
            var modifierMask = this.lastModifierPress;
        }
        // stop the event's key
        for (let keybind of this.getKeybinds(hitKey.toLowerCase(), modifierMask)) {
            keybind.onPress();
        }
        // go through all current keys at the current modifier and hit all of them
        for (let key of this.currentKeys) {
            for (let keybind of this.getKeybinds(key, modifierMask)) {
                keybind.onPress();
            }
        }
        if (this.currentKeys.indexOf(hitKey) == -1) {
            this.currentKeys.push(hitKey);
        }
        this.lastModifierPress = modifierMask;
    }
    static onRelease(event) {
        // get the key info if we're a keyboard event
        if (event instanceof KeyboardEvent) {
            var hitKey = event.key.toLowerCase();
            var modifierMask = event.altKey << 2 | event.ctrlKey << 1 | event.shiftKey;
        }
        // get the mouse info if we're a mouse event
        else {
            var hitKey = `mouse${event.button}`;
            var modifierMask = this.lastModifierPress;
        }
        // stop the event's key
        for (let keybind of this.getKeybinds(hitKey.toLowerCase(), modifierMask | this.lastModifierPress)) {
            keybind.onRelease();
        }
        this.currentKeys.splice(this.currentKeys.indexOf(hitKey), 1);
        // go through all current keys at the current modifier and release all of them
        for (let key of this.currentKeys) {
            let keybinds = this.getKeybinds(key, this.lastModifierPress, modifierMask);
            for (let keybind of keybinds) {
                keybind.onRelease();
            }
        }
        this.lastModifierPress = modifierMask;
    }
    static getKeybinds(key, modifier, exclude) {
        let getKeybinds = (key, modifier) => {
            if (!this.map[key]) {
                return [];
            }
            else {
                return this.map[key][modifier] != undefined ? this.map[key][modifier] : [];
            }
        };
        // if the modifier has more than one mask on, then combine the different hit bitmasks together (so ctrl + shift + a will trigger the keybind ctrl + a and the keybind ctrl + shift + a for instance)
        if (Math.log2(modifier) % 1 != 0) {
            if (exclude !== 0) {
                var combo = getKeybinds(key, modifier);
            }
            else {
                var combo = [];
            }
            for (let i = 0; i < 3; i++) {
                // checking to see if value is true at a specific location in the bitmask
                if ((modifier & (1 << i)) && (exclude === undefined || !(exclude & (1 << i)))) {
                    combo = combo.concat(getKeybinds(key, 1 << i));
                }
            }
            return combo;
        }
        else if (exclude !== 0) {
            return getKeybinds(key, modifier);
        }
        else {
            return [];
        }
    }
}
// map of the key string and key modifier to keybind object
KeybindController.map = {};
KeybindController.lastModifierPress = 0;
KeybindController.currentKeys = [];
exports.default = KeybindController;
if (typeof document != "undefined") {
    document.addEventListener("keydown", KeybindController.onPress.bind(KeybindController));
    document.addEventListener("keyup", KeybindController.onRelease.bind(KeybindController));
    document.addEventListener("mousedown", KeybindController.onPress.bind(KeybindController));
    document.addEventListener("mouseup", KeybindController.onRelease.bind(KeybindController));
}
//# sourceMappingURL=keybinds.js.map
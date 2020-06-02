import { AssertionError } from "assert";

export default function assert(condition: any, message?: string): asserts condition {
    if(!condition) {
        throw new AssertionError({ message })
    }
}
//import { Animal } from "./animal.js";
import { Entity } from "./entity.js";
/**
 * Enum of message type.
 * @enum 
 */
export let MessageTypes = {
    None: Symbol("none"),
    Sound: Symbol("sound"),
    Interact: Symbol("interact"),
    Copulate: Symbol("copulate")
};
export class Message
{
    /**
     * 
     * @param {Entity} sender - The sender of this message.
     * @param {Entity} receiver - The receiver of this message.
     * @param {symbol} type - Tht type of this message.
     * @param {*} data - The data of this message.
     */
    constructor(sender, receiver, type, data)
    {
        this.sender = sender;
        this.receiver = receiver;
        this.type = type;
        this.data = data;
    }
}
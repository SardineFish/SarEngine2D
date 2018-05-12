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
     */
    constructor(sender, receiver)
    {
        this.sender = sender;
        this.receiver = receiver;
    }

	dispatch()
	{
		this.receiver.onMessage(this);
	}
}
export class SoundMessage extends Message
{
    /**
     * 
     * @param {Entity} sender 
     * @param {Entity} reciever 
     * @param {Sound} sound 
     */
	constructor(sender, reciever, sound)
	{
		super(sender, reciever);
		this.sound = sound;
	}
}
export class AttackMessage extends Message
{
    /**
     * 
     * @param {Entity} attacker 
     * @param {Entity} victim 
     * @param {Number} damage 
     */
    constructor(attacker, victim, damage)
    {
        super(attacker, victim);
        this.attacker = attacker;
        this.victim = victim;
        this.damage = damage;
    }
}
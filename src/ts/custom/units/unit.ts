import RemoteObject from "../../network/remoteObject";
import { networkClass, illegal, gameClass } from "../../network/networkDecorators";
import Vector from "../../helpers/vector";
import Game from "../../game/game";
import Sprite from "../../render/sprite";
import Attack from "./attacks/attack";
import BattleTeam from "./battleTeam";
import Movement from "./movements/movement";
import Hex from "../hexes/hex";
import BattleGamemode, { BattlePhase } from "../gamemodes/battleGamemode";
import SpriteSheet from "../../render/spriteSheet";
import ArcAttack from "./attacks/arcAttack";

/*
units need to:
- move
- attack
- take damage
- perform special attacks
- have special properties
*/
@networkClass("%[Unit: team]")
export default abstract class Unit extends RemoteObject {
	protected static resource: string
	@illegal protected sprite: SpriteSheet
	@illegal public attack: ArcAttack // we are able to get/set our attack whenever we want to, without worrying about consequences
	@illegal public movement: Movement // we are able to get/set our movement whenever we want to, without worrying about consequences
	public team: BattleTeam

	protected hex_: Hex



	constructor(game: Game, team: BattleTeam) {
		super(game)
	}

	public reconstructor(game: Game, team: BattleTeam): void {
		super.reconstructor(game)
		
		this.team = team
		this.team.units.add(this);
		(this.game.gamemode as BattleGamemode).units.push(this)

		this.attack = new ArcAttack(this.game, this)
	}

	protected createSprite(): void {
		if(this.game.isClient) {
			this.sprite = new SpriteSheet(this.game, (this.constructor as typeof Unit).resource)
			this.sprite.isVisible = false

			// if we already have a hex, then set our sprite position
			if(this.hex) {
				this.hex.unit = this
			}
		}
	}

	public onSelected(): void {
		this.movement.show()
	}

	public onDeSelected(): void {
		this.movement.hide()
	}

	public set hex(hex: Hex) {
		this.hex_ = hex

		if(hex !== undefined) {
			let position = Hex.hexPositionToWorldPosition(hex.getPosition().x, hex.getPosition().y)

			if(this.sprite) {
				this.sprite.setPosition(this.sprite.getPosition().set(position[0], position[1]))
				this.sprite.isVisible = true // make the sprite visible when we get a hex home	
			}
		}
	}

	public get hex(): Hex {
		return this.hex_
	}

	public setSpritePosition(position: Vector): void {
		this.sprite?.setPosition(position)
	}

	public getSpritePosition(): Vector {
		return this.sprite?.getPosition()
	}

	public destroy(): void {
		super.destroy()

		this.sprite?.destroy();
		(this.game.gamemode as BattleGamemode).units.splice((this.game.gamemode as BattleGamemode).units.indexOf(this), 1)
		this.team.units.delete(this)

		this.attack.destroy()
		this.movement.destroy()
	}
}
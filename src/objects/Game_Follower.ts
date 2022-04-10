import {Game_Character} from './Game_Character'
import {global} from '../managers/DataManager'

// Game_Follower
//
// The game object class for a follower. A follower is an allied character,
// other than the front character, displayed in the party.
export class Game_Follower extends Game_Character {

  private readonly _memberIndex

  constructor(memberIndex) {
    super()
    this._memberIndex = memberIndex
    this.setTransparent(global.$dataSystem.optTransparent)
    this.setThrough(true)
  }

  refresh() {
    const characterName = this.isVisible() ? this.actor().characterName() : ''
    const characterIndex = this.isVisible() ? this.actor().characterIndex() : 0
    this.setImage(characterName, characterIndex)
  }

  actor() {
    return global.$gameParty.battleMembers()[this._memberIndex]
  }

  isVisible() {
    return this.actor() && global.$gamePlayer.followers().isVisible()
  }

  override update() {
    super.update()
    this.setMoveSpeed(global.$gamePlayer.realMoveSpeed())
    this.setOpacity(global.$gamePlayer.opacity())
    this.setBlendMode(global.$gamePlayer.blendMode())
    this.setWalkAnime(global.$gamePlayer.hasWalkAnime())
    this.setStepAnime(global.$gamePlayer.hasStepAnime())
    this.setDirectionFix(global.$gamePlayer.isDirectionFixed())
    this.setTransparent(global.$gamePlayer.isTransparent())
  }

  chaseCharacter(character) {
    const sx = this.deltaXFrom(character.x)
    const sy = this.deltaYFrom(character.y)
    if (sx !== 0 && sy !== 0) {
      this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2)
    } else if (sx !== 0) {
      this.moveStraight(sx > 0 ? 4 : 6)
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 8 : 2)
    }
    this.setMoveSpeed(global.$gamePlayer.realMoveSpeed())
  }
}

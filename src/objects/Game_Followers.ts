import {global} from '../managers/DataManager'
import {Game_Follower} from './Game_Follower'

// Game_Followers
//
// The wrapper class for a follower array.
export class Game_Followers {

  private _visible = false
  private _gathering = false
  private _data: Game_Follower[] = []

  constructor() {
    this._visible = global.$dataSystem.optFollowers
    for (let i = 1; i < global.$gameParty.maxBattleMembers(); i++) {
      this._data.push(new Game_Follower(i))
    }
  }

  isVisible() {
    return this._visible
  }

  show() {
    this._visible = true
  }

  hide() {
    this._visible = false
  }

  follower(index: number) {
    return this._data[index]
  }

  forEach(callback: (i: Game_Follower) => void) {
    this._data.forEach(callback)
  }

  reverseEach(callback: (i: Game_Follower) => void) {
    this._data.reverse()
    this._data.forEach(callback)
    this._data.reverse()
  }

  refresh() {
    this.forEach((follower) => follower.refresh())
  }

  update() {
    if (this.areGathering()) {
      if (!this.areMoving()) {
        this.updateMove()
      }
      if (this.areGathered()) {
        this._gathering = false
      }
    }
    this.forEach((follower) => follower.update())
  }

  updateMove() {
    for (let i = this._data.length - 1; i >= 0; i--) {
      const precedingCharacter = (i > 0 ? this._data[i - 1] : global.$gamePlayer)
      this._data[i].chaseCharacter(precedingCharacter)
    }
  }

  jumpAll() {
    if (global.$gamePlayer.isJumping()) {
      for (let i = 0; i < this._data.length; i++) {
        const follower = this._data[i]
        const sx = global.$gamePlayer.deltaXFrom(follower.x)
        const sy = global.$gamePlayer.deltaYFrom(follower.y)
        follower.jump(sx, sy)
      }
    }
  }

  synchronize(x: number, y: number, d: number) {
    this.forEach((follower) => {
      follower.locate(x, y)
      follower.setDirection(d)
    })
  }

  gather() {
    this._gathering = true
  }

  areGathering() {
    return this._gathering
  }

  visibleFollowers() {
    return this._data.filter((follower) => follower.isVisible())
  }

  areMoving() {
    return this.visibleFollowers().some((follower) => follower.isMoving())
  }

  areGathered() {
    return this.visibleFollowers().every((follower) => {
      return !follower.isMoving() && follower.pos(global.$gamePlayer.x, global.$gamePlayer.y)
    })
  }

  isSomeoneCollided(x, y) {
    return this.visibleFollowers().some((follower) => follower.pos(x, y))
  }
}

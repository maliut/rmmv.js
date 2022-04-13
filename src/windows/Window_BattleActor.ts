import {Window_BattleStatus} from './Window_BattleStatus'
import {global} from '../managers/DataManager'

// Window_BattleActor
//
// The window for selecting a target actor on the battle screen.
export class Window_BattleActor extends Window_BattleStatus {

  constructor(x, y) {
    super()
    this.x = x
    this.y = y
  }

  override initialize() {
    super.initialize()
    this.openness = 255
    this.hide()
    return this
  }

  override show() {
    this.select(0)
    super.show()
  }

  override hide() {
    super.hide()
    global.$gameParty.select(null)
  }

  override select(index) {
    super.select(index)
    global.$gameParty.select(this.actor())
  }

  actor() {
    return global.$gameParty.members()[this.index()]
  }

}

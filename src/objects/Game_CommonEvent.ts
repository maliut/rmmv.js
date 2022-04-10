import {global} from '../managers/DataManager'
import {Game_Interpreter} from './Game_Interpreter'

// Game_CommonEvent
//
// The game object class for a common event. It contains functionality for
// running parallel process events.
export class Game_CommonEvent {

  private readonly _commonEventId
  private _interpreter = null

  constructor(commonEventId) {
    this._commonEventId = commonEventId
    this.refresh()
  }

  event() {
    return global.$dataCommonEvents[this._commonEventId]
  }

  list() {
    return this.event().list
  }

  refresh() {
    if (this.isActive()) {
      if (!this._interpreter) {
        this._interpreter = new Game_Interpreter()
      }
    } else {
      this._interpreter = null
    }
  }

  isActive() {
    const event = this.event()
    return event.trigger === 2 && global.$gameSwitches.value(event.switchId)
  }

  update() {
    if (this._interpreter) {
      if (!this._interpreter.isRunning()) {
        this._interpreter.setup(this.list())
      }
      this._interpreter.update()
    }
  }
}

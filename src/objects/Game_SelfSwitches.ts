import {global} from '../managers/DataManager'

// Game_SelfSwitches
//
// The game object class for self switches.
export class Game_SelfSwitches {

  private _data = {}

  constructor() {
    this.clear()
  }

  clear() {
    this._data = {}
  }

  value(key) {
    return !!this._data[key]
  }

  setValue(key, value) {
    if (value) {
      this._data[key] = true
    } else {
      delete this._data[key]
    }
    this.onChange()
  }

  onChange() {
    global.$gameMap.requestRefresh()
  }
}

import {global} from '../managers/DataManager'

// Game_Switches
//
// The game object class for switches.
export class Game_Switches {

  private _data = []

  constructor() {
    this.clear()
  }

  clear() {
    this._data = []
  }

  value(switchId) {
    return !!this._data[switchId]
  }

  setValue(switchId, value) {
    if (switchId > 0 && switchId < global.$dataSystem.switches.length) {
      this._data[switchId] = value
      this.onChange()
    }
  }

  onChange() {
    global.$gameMap.requestRefresh()
  }
}

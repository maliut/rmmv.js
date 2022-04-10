import {global} from '../managers/DataManager'

// Game_Variables
//
// The game object class for variables.
export class Game_Variables {

  private _data = []

  constructor() {
    this.clear()
  }

  clear() {
    this._data = []
  }

  value(variableId) {
    return this._data[variableId] || 0
  }

  setValue(variableId, value) {
    if (variableId > 0 && variableId < global.$dataSystem.variables.length) {
      if (typeof value === 'number') {
        value = Math.floor(value)
      }
      this._data[variableId] = value
      this.onChange()
    }
  }

  onChange() {
    global.$gameMap.requestRefresh()
  }
}

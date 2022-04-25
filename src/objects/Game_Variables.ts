import {global} from '../managers/DataManager'

// Game_Variables
//
// The game object class for variables.
export class Game_Variables {

  private _data: number[] = []

  value(variableId: number) {
    return this._data[variableId] || 0
  }

  setValue(variableId: number, value: number) {
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

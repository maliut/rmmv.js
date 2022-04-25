import {global} from '../managers/DataManager'

// Game_SelfSwitches
//
// The game object class for self switches.
export class Game_SelfSwitches {

  private _data: Record<string, boolean> = {}

  value(key: string) {
    return this._data[key]
  }

  setValue(key: string, value: boolean) {
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

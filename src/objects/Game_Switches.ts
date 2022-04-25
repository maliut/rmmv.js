import {global} from '../managers/DataManager'

// Game_Switches
//
// The game object class for switches.
export class Game_Switches {

  private _data: boolean[] = []

  value(switchId: number) {
    return this._data[switchId]
  }

  setValue(switchId: number, value: boolean) {
    if (switchId > 0 && switchId < global.$dataSystem.switches.length) {
      this._data[switchId] = value
      this.onChange()
    }
  }

  onChange() {
    global.$gameMap.requestRefresh()
  }
}

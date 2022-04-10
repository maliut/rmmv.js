import {Utils} from '../core/Utils'
import {global} from '../managers/DataManager'

// Game_Temp
//
// The game object class for temporary data that is not included in save data.
export class Game_Temp {

  private _isPlaytest = Utils.isOptionValid('test')
  private _commonEventId = 0
  private _destinationX = null
  private _destinationY = null

  isPlaytest() {
    return this._isPlaytest
  }

  reserveCommonEvent(commonEventId) {
    this._commonEventId = commonEventId
  }

  clearCommonEvent() {
    this._commonEventId = 0
  }

  isCommonEventReserved() {
    return this._commonEventId > 0
  }

  reservedCommonEvent() {
    return global.$dataCommonEvents[this._commonEventId]
  }

  setDestination(x, y) {
    this._destinationX = x
    this._destinationY = y
  }

  clearDestination() {
    this._destinationX = null
    this._destinationY = null
  }

  isDestinationValid() {
    return this._destinationX !== null
  }

  destinationX() {
    return this._destinationX
  }

  destinationY() {
    return this._destinationY
  }
}

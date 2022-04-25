import {global} from '../managers/DataManager'
import {Game_Actor} from './Game_Actor'

// Game_Actors
//
// The wrapper class for an actor array.
export class Game_Actors {
  private _data: Game_Actor[] = []

  actor(actorId: number) {
    if (global.$dataActors[actorId]) {
      if (!this._data[actorId]) {
        this._data[actorId] = new Game_Actor(actorId)
      }
      return this._data[actorId]
    }
    return null
  }
}

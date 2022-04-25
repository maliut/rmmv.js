import {Game_Character} from './Game_Character'
import {global} from '../managers/DataManager'
import {AudioManager} from '../managers/AudioManager'
import {assert} from '../utils'
import {Data_Audio} from '../types/global'
import {VehicleType} from '../types/index'

// Game_Vehicle
//
// The game object class for a vehicle.
export class Game_Vehicle extends Game_Character {

  private readonly _type: VehicleType
  private _mapId = 0
  private _altitude = 0
  private _driving = false
  private _bgm: Data_Audio | null = null

  constructor(type: VehicleType) {
    super()
    this._type = type
    this.resetDirection()
    this.initMoveSpeed()
    this.loadSystemSettings()
  }

  isBoat() {
    return this._type === 'boat'
  }

  isShip() {
    return this._type === 'ship'
  }

  isAirship() {
    return this._type === 'airship'
  }

  resetDirection() {
    this.setDirection(4)
  }

  initMoveSpeed() {
    if (this.isBoat()) {
      this.setMoveSpeed(4)
    } else if (this.isShip()) {
      this.setMoveSpeed(5)
    } else if (this.isAirship()) {
      this.setMoveSpeed(6)
    }
  }

  vehicle() {
    if (this.isBoat()) {
      return global.$dataSystem.boat
    } else if (this.isShip()) {
      return global.$dataSystem.ship
    } else if (this.isAirship()) {
      return global.$dataSystem.airship
    } else {
      return null
    }
  }

  loadSystemSettings() {
    const vehicle = this.vehicle()
    assert(vehicle !== null)
    this._mapId = vehicle.startMapId
    this.setPosition(vehicle.startX, vehicle.startY)
    this.setImage(vehicle.characterName, vehicle.characterIndex)
  }

  refresh() {
    if (this._driving) {
      this._mapId = global.$gameMap.mapId()
      this.syncWithPlayer()
    } else if (this._mapId === global.$gameMap.mapId()) {
      this.locate(this.x, this.y)
    }
    if (this.isAirship()) {
      this.setPriorityType(this._driving ? 2 : 0)
    } else {
      this.setPriorityType(1)
    }
    this.setWalkAnime(this._driving)
    this.setStepAnime(this._driving)
    this.setTransparent(this._mapId !== global.$gameMap.mapId())
  }

  setLocation(mapId: number, x: number, y: number) {
    this._mapId = mapId
    this.setPosition(x, y)
    this.refresh()
  }

  override pos(x: number, y: number) {
    if (this._mapId === global.$gameMap.mapId()) {
      return super.pos(x, y)
    } else {
      return false
    }
  }

  override isMapPassable(x: number, y: number, d: number) {
    const x2 = global.$gameMap.roundXWithDirection(x, d)
    const y2 = global.$gameMap.roundYWithDirection(y, d)
    if (this.isBoat()) {
      return global.$gameMap.isBoatPassable(x2, y2)
    } else if (this.isShip()) {
      return global.$gameMap.isShipPassable(x2, y2)
    } else if (this.isAirship()) {
      return true
    } else {
      return false
    }
  }

  getOn() {
    this._driving = true
    this.setWalkAnime(true)
    this.setStepAnime(true)
    global.$gameSystem.saveWalkingBgm()
    this.playBgm()
  }

  getOff() {
    this._driving = false
    this.setWalkAnime(false)
    this.setStepAnime(false)
    this.resetDirection()
    global.$gameSystem.replayWalkingBgm()
  }

  setBgm(bgm: Data_Audio | null) {
    this._bgm = bgm
  }

  playBgm() {
    AudioManager.playBgm(this._bgm || this.vehicle()!.bgm)
  }

  syncWithPlayer() {
    this.copyPosition(global.$gamePlayer)
    this.refreshBushDepth()
  }

  override screenY() {
    return super.screenY() - this._altitude
  }

  shadowX() {
    return this.screenX()
  }

  shadowY() {
    return this.screenY() + this._altitude
  }

  shadowOpacity() {
    return 255 * this._altitude / this.maxAltitude()
  }

  canMove() {
    if (this.isAirship()) {
      return this.isHighest()
    } else {
      return true
    }
  }

  override update() {
    super.update()
    if (this.isAirship()) {
      this.updateAirship()
    }
  }

  updateAirship() {
    this.updateAirshipAltitude()
    this.setStepAnime(this.isHighest())
    this.setPriorityType(this.isLowest() ? 0 : 2)
  }

  updateAirshipAltitude() {
    if (this._driving && !this.isHighest()) {
      this._altitude++
    }
    if (!this._driving && !this.isLowest()) {
      this._altitude--
    }
  }

  maxAltitude() {
    return 48
  }

  isLowest() {
    return this._altitude <= 0
  }

  isHighest() {
    return this._altitude >= this.maxAltitude()
  }

  isTakeoffOk() {
    return global.$gamePlayer.areFollowersGathered()
  }

  isLandOk(x: number, y: number, d: number) {
    if (this.isAirship()) {
      if (!global.$gameMap.isAirshipLandOk(x, y)) {
        return false
      }
      if (global.$gameMap.eventsXy(x, y).length > 0) {
        return false
      }
    } else {
      const x2 = global.$gameMap.roundXWithDirection(x, d)
      const y2 = global.$gameMap.roundYWithDirection(y, d)
      if (!global.$gameMap.isValid(x2, y2)) {
        return false
      }
      if (!global.$gameMap.isPassable(x2, y2, this.reverseDir(d))) {
        return false
      }
      if (this.isCollidedWithCharacters(x2, y2)) {
        return false
      }
    }
    return true
  }
}

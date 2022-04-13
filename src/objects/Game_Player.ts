import {Game_Character} from './Game_Character'
import {global} from '../managers/DataManager'
import {Input} from '../core/Input'
import {Graphics} from '../core/Graphics'
import {BattleManager} from '../managers/BattleManager'
import {ConfigManager} from '../managers/ConfigManager'
import {TouchInput} from '../core/TouchInput'
import {Game_Followers} from './Game_Followers'

// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.
export class Game_Player extends Game_Character {

  private _vehicleType = 'walk'
  private _vehicleGettingOn = false
  private _vehicleGettingOff = false
  private _dashing = false
  private _needsMapReload = false
  private _transferring = false
  private _newMapId = 0
  private _newX = 0
  private _newY = 0
  private _newDirection = 0
  private _fadeType = 0
  private _followers = new Game_Followers()
  private _encounterCount = 0

  constructor() {
    super()
    this.setTransparent(global.$dataSystem.optTransparent)
  }

  override initMembers() {
    super.initMembers()
    // this._vehicleType = 'walk'
    // this._vehicleGettingOn = false
    // this._vehicleGettingOff = false
    // this._dashing = false
    // this._needsMapReload = false
    // this._transferring = false
    // this._newMapId = 0
    // this._newX = 0
    // this._newY = 0
    // this._newDirection = 0
    // this._fadeType = 0
    // this._followers = new Game_Followers()
    // this._encounterCount = 0
  }

  clearTransferInfo() {
    this._transferring = false
    this._newMapId = 0
    this._newX = 0
    this._newY = 0
    this._newDirection = 0
  }

  followers() {
    return this._followers
  }

  refresh() {
    const actor = global.$gameParty.leader()
    const characterName = actor ? actor.characterName() : ''
    const characterIndex = actor ? actor.characterIndex() : 0
    this.setImage(characterName, characterIndex)
    this._followers.refresh()
  }

  override isStopping() {
    if (this._vehicleGettingOn || this._vehicleGettingOff) {
      return false
    }
    return super.isStopping()
  }

  reserveTransfer(mapId, x, y, d = 0, fadeType = 0) { // changed
    this._transferring = true
    this._newMapId = mapId
    this._newX = x
    this._newY = y
    this._newDirection = d
    this._fadeType = fadeType
  }

  requestMapReload() {
    this._needsMapReload = true
  }

  isTransferring() {
    return this._transferring
  }

  newMapId() {
    return this._newMapId
  }

  fadeType() {
    return this._fadeType
  }

  performTransfer() {
    if (this.isTransferring()) {
      this.setDirection(this._newDirection)
      if (this._newMapId !== global.$gameMap.mapId() || this._needsMapReload) {
        global.$gameMap.setup(this._newMapId)
        this._needsMapReload = false
      }
      this.locate(this._newX, this._newY)
      this.refresh()
      this.clearTransferInfo()
    }
  }

  override isMapPassable(x, y, d) {
    const vehicle = this.vehicle()
    if (vehicle) {
      return vehicle.isMapPassable(x, y, d)
    } else {
      return super.isMapPassable(x, y, d)
    }
  }

  vehicle() {
    return global.$gameMap.vehicle(this._vehicleType)
  }

  isInBoat() {
    return this._vehicleType === 'boat'
  }

  isInShip() {
    return this._vehicleType === 'ship'
  }

  isInAirship() {
    return this._vehicleType === 'airship'
  }

  isInVehicle() {
    return this.isInBoat() || this.isInShip() || this.isInAirship()
  }

  isNormal() {
    return this._vehicleType === 'walk' && !this.isMoveRouteForcing()
  }

  override isDashing() {
    return this._dashing
  }

  override isDebugThrough() {
    return Input.isPressed('control') && global.$gameTemp.isPlaytest()
  }

  isCollided(x, y) {
    if (this.isThrough()) {
      return false
    } else {
      return this.pos(x, y) || this._followers.isSomeoneCollided(x, y)
    }
  }

  centerX() {
    return (Graphics.width / global.$gameMap.tileWidth() - 1) / 2.0
  }

  centerY() {
    return (Graphics.height / global.$gameMap.tileHeight() - 1) / 2.0
  }

  center(x, y) {
    return global.$gameMap.setDisplayPos(x - this.centerX(), y - this.centerY())
  }

  override locate(x, y) {
    super.locate(x, y)
    this.center(x, y)
    this.makeEncounterCount()
    if (this.isInVehicle()) {
      this.vehicle().refresh()
    }
    this._followers.synchronize(x, y, this.direction())
  }

  override increaseSteps() {
    super.increaseSteps()
    if (this.isNormal()) {
      global.$gameParty.increaseSteps()
    }
  }

  makeEncounterCount() {
    const n = global.$gameMap.encounterStep()
    this._encounterCount = Math.randomInt(n) + Math.randomInt(n) + 1
  }

  makeEncounterTroopId() {
    const encounterList = []
    let weightSum = 0
    global.$gameMap.encounterList().forEach(function (encounter) {
      if (this.meetsEncounterConditions(encounter)) {
        encounterList.push(encounter)
        weightSum += encounter.weight
      }
    }, this)
    if (weightSum > 0) {
      let value = Math.randomInt(weightSum)
      for (let i = 0; i < encounterList.length; i++) {
        value -= encounterList[i].weight
        if (value < 0) {
          return encounterList[i].troopId
        }
      }
    }
    return 0
  }

  meetsEncounterConditions(encounter) {
    return (encounter.regionSet.length === 0 ||
      encounter.regionSet.contains(this.regionId()))
  }

  executeEncounter() {
    if (!global.$gameMap.isEventRunning() && this._encounterCount <= 0) {
      this.makeEncounterCount()
      const troopId = this.makeEncounterTroopId()
      if (global.$dataTroops[troopId]) {
        BattleManager.setup(troopId, true, false)
        BattleManager.onEncounter()
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  startMapEvent(x, y, triggers, normal) {
    if (!global.$gameMap.isEventRunning()) {
      global.$gameMap.eventsXy(x, y).forEach(function (event) {
        if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
          event.start()
        }
      })
    }
  }

  moveByInput() {
    if (!this.isMoving() && this.canMove()) {
      let direction = this.getInputDirection()
      if (direction > 0) {
        global.$gameTemp.clearDestination()
      } else if (global.$gameTemp.isDestinationValid()) {
        const x = global.$gameTemp.destinationX()
        const y = global.$gameTemp.destinationY()
        direction = this.findDirectionTo(x, y)
      }
      if (direction > 0) {
        this.executeMove(direction)
      }
    }
  }

  canMove() {
    if (global.$gameMap.isEventRunning() || global.$gameMessage.isBusy()) {
      return false
    }
    if (this.isMoveRouteForcing() || this.areFollowersGathering()) {
      return false
    }
    if (this._vehicleGettingOn || this._vehicleGettingOff) {
      return false
    }
    if (this.isInVehicle() && !this.vehicle().canMove()) {
      return false
    }
    return true
  }

  getInputDirection() {
    return Input.dir4
  }

  executeMove(direction) {
    this.moveStraight(direction)
  }

  override update(sceneActive) {
    const lastScrolledX = this.scrolledX()
    const lastScrolledY = this.scrolledY()
    const wasMoving = this.isMoving()
    this.updateDashing()
    if (sceneActive) {
      this.moveByInput()
    }
    super.update()
    this.updateScroll(lastScrolledX, lastScrolledY)
    this.updateVehicle()
    if (!this.isMoving()) {
      this.updateNonmoving(wasMoving)
    }
    this._followers.update()
  }

  updateDashing() {
    if (this.isMoving()) {
      return
    }
    if (this.canMove() && !this.isInVehicle() && !global.$gameMap.isDashDisabled()) {
      this._dashing = this.isDashButtonPressed() || global.$gameTemp.isDestinationValid()
    } else {
      this._dashing = false
    }
  }

  isDashButtonPressed() {
    const shift = Input.isPressed('shift')
    if (ConfigManager.alwaysDash) {
      return !shift
    } else {
      return shift
    }
  }

  updateScroll(lastScrolledX, lastScrolledY) {
    const x1 = lastScrolledX
    const y1 = lastScrolledY
    const x2 = this.scrolledX()
    const y2 = this.scrolledY()
    if (y2 > y1 && y2 > this.centerY()) {
      global.$gameMap.scrollDown(y2 - y1)
    }
    if (x2 < x1 && x2 < this.centerX()) {
      global.$gameMap.scrollLeft(x1 - x2)
    }
    if (x2 > x1 && x2 > this.centerX()) {
      global.$gameMap.scrollRight(x2 - x1)
    }
    if (y2 < y1 && y2 < this.centerY()) {
      global.$gameMap.scrollUp(y1 - y2)
    }
  }

  updateVehicle() {
    if (this.isInVehicle() && !this.areFollowersGathering()) {
      if (this._vehicleGettingOn) {
        this.updateVehicleGetOn()
      } else if (this._vehicleGettingOff) {
        this.updateVehicleGetOff()
      } else {
        this.vehicle().syncWithPlayer()
      }
    }
  }

  updateVehicleGetOn() {
    if (!this.areFollowersGathering() && !this.isMoving()) {
      this.setDirection(this.vehicle().direction())
      this.setMoveSpeed(this.vehicle().moveSpeed())
      this._vehicleGettingOn = false
      this.setTransparent(true)
      if (this.isInAirship()) {
        this.setThrough(true)
      }
      this.vehicle().getOn()
    }
  }

  updateVehicleGetOff() {
    if (!this.areFollowersGathering() && this.vehicle().isLowest()) {
      this._vehicleGettingOff = false
      this._vehicleType = 'walk'
      this.setTransparent(false)
    }
  }

  updateNonmoving(wasMoving) {
    if (!global.$gameMap.isEventRunning()) {
      if (wasMoving) {
        global.$gameParty.onPlayerWalk()
        this.checkEventTriggerHere([1, 2])
        if (global.$gameMap.setupStartingEvent()) {
          return
        }
      }
      if (this.triggerAction()) {
        return
      }
      if (wasMoving) {
        this.updateEncounterCount()
      } else {
        global.$gameTemp.clearDestination()
      }
    }
  }

  triggerAction() {
    if (this.canMove()) {
      if (this.triggerButtonAction()) {
        return true
      }
      if (this.triggerTouchAction()) {
        return true
      }
    }
    return false
  }

  triggerButtonAction() {
    if (Input.isTriggered('ok')) {
      if (this.getOnOffVehicle()) {
        return true
      }
      this.checkEventTriggerHere([0])
      if (global.$gameMap.setupStartingEvent()) {
        return true
      }
      this.checkEventTriggerThere([0, 1, 2])
      if (global.$gameMap.setupStartingEvent()) {
        return true
      }
    }
    return false
  }

  triggerTouchAction() {
    if (global.$gameTemp.isDestinationValid()) {
      const direction = this.direction()
      const x1 = this.x
      const y1 = this.y
      const x2 = global.$gameMap.roundXWithDirection(x1, direction)
      const y2 = global.$gameMap.roundYWithDirection(y1, direction)
      const x3 = global.$gameMap.roundXWithDirection(x2, direction)
      const y3 = global.$gameMap.roundYWithDirection(y2, direction)
      const destX = global.$gameTemp.destinationX()
      const destY = global.$gameTemp.destinationY()
      if (destX === x1 && destY === y1) {
        return this.triggerTouchActionD1(x1, y1)
      } else if (destX === x2 && destY === y2) {
        return this.triggerTouchActionD2(x2, y2)
      } else if (destX === x3 && destY === y3) {
        return this.triggerTouchActionD3(x2, y2)
      }
    }
    return false
  }

  triggerTouchActionD1(x1, y1) {
    if (global.$gameMap.airship().pos(x1, y1)) {
      if (TouchInput.isTriggered() && this.getOnOffVehicle()) {
        return true
      }
    }
    this.checkEventTriggerHere([0])
    return global.$gameMap.setupStartingEvent()
  }

  triggerTouchActionD2(x2, y2) {
    if (global.$gameMap.boat().pos(x2, y2) || global.$gameMap.ship().pos(x2, y2)) {
      if (TouchInput.isTriggered() && this.getOnVehicle()) {
        return true
      }
    }
    if (this.isInBoat() || this.isInShip()) {
      if (TouchInput.isTriggered() && this.getOffVehicle()) {
        return true
      }
    }
    this.checkEventTriggerThere([0, 1, 2])
    return global.$gameMap.setupStartingEvent()
  }

  triggerTouchActionD3(x2, y2) {
    if (global.$gameMap.isCounter(x2, y2)) {
      this.checkEventTriggerThere([0, 1, 2])
    }
    return global.$gameMap.setupStartingEvent()
  }

  updateEncounterCount() {
    if (this.canEncounter()) {
      this._encounterCount -= this.encounterProgressValue()
    }
  }

  canEncounter() {
    return (!global.$gameParty.hasEncounterNone() && global.$gameSystem.isEncounterEnabled() &&
      !this.isInAirship() && !this.isMoveRouteForcing() && !this.isDebugThrough())
  }

  encounterProgressValue() {
    let value = global.$gameMap.isBush(this.x, this.y) ? 2 : 1
    if (global.$gameParty.hasEncounterHalf()) {
      value *= 0.5
    }
    if (this.isInShip()) {
      value *= 0.5
    }
    return value
  }

  checkEventTriggerHere(triggers) {
    if (this.canStartLocalEvents()) {
      this.startMapEvent(this.x, this.y, triggers, false)
    }
  }

  checkEventTriggerThere(triggers) {
    if (this.canStartLocalEvents()) {
      const direction = this.direction()
      const x1 = this.x
      const y1 = this.y
      const x2 = global.$gameMap.roundXWithDirection(x1, direction)
      const y2 = global.$gameMap.roundYWithDirection(y1, direction)
      this.startMapEvent(x2, y2, triggers, true)
      if (!global.$gameMap.isAnyEventStarting() && global.$gameMap.isCounter(x2, y2)) {
        const x3 = global.$gameMap.roundXWithDirection(x2, direction)
        const y3 = global.$gameMap.roundYWithDirection(y2, direction)
        this.startMapEvent(x3, y3, triggers, true)
      }
    }
  }

  override checkEventTriggerTouch(x, y) {
    if (this.canStartLocalEvents()) {
      this.startMapEvent(x, y, [1, 2], true)
    }
    return super.checkEventTriggerTouch(x, y) // changed
  }

  canStartLocalEvents() {
    return !this.isInAirship()
  }

  getOnOffVehicle() {
    if (this.isInVehicle()) {
      return this.getOffVehicle()
    } else {
      return this.getOnVehicle()
    }
  }

  getOnVehicle() {
    const direction = this.direction()
    const x1 = this.x
    const y1 = this.y
    const x2 = global.$gameMap.roundXWithDirection(x1, direction)
    const y2 = global.$gameMap.roundYWithDirection(y1, direction)
    if (global.$gameMap.airship().pos(x1, y1)) {
      this._vehicleType = 'airship'
    } else if (global.$gameMap.ship().pos(x2, y2)) {
      this._vehicleType = 'ship'
    } else if (global.$gameMap.boat().pos(x2, y2)) {
      this._vehicleType = 'boat'
    }
    if (this.isInVehicle()) {
      this._vehicleGettingOn = true
      if (!this.isInAirship()) {
        this.forceMoveForward()
      }
      this.gatherFollowers()
    }
    return this._vehicleGettingOn
  }

  getOffVehicle() {
    if (this.vehicle().isLandOk(this.x, this.y, this.direction())) {
      if (this.isInAirship()) {
        this.setDirection(2)
      }
      this._followers.synchronize(this.x, this.y, this.direction())
      this.vehicle().getOff()
      if (!this.isInAirship()) {
        this.forceMoveForward()
        this.setTransparent(false)
      }
      this._vehicleGettingOff = true
      this.setMoveSpeed(4)
      this.setThrough(false)
      this.makeEncounterCount()
      this.gatherFollowers()
    }
    return this._vehicleGettingOff
  }

  forceMoveForward() {
    this.setThrough(true)
    this.moveForward()
    this.setThrough(false)
  }

  isOnDamageFloor() {
    return global.$gameMap.isDamageFloor(this.x, this.y) && !this.isInAirship()
  }

  override moveStraight(d) {
    if (this.canPass(this.x, this.y, d)) {
      this._followers.updateMove()
    }
    super.moveStraight(d)
  }

  override moveDiagonally(horz, vert) {
    if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
      this._followers.updateMove()
    }
    super.moveDiagonally(horz, vert)
  }

  override jump(xPlus, yPlus) {
    super.jump(xPlus, yPlus)
    this._followers.jumpAll()
  }

  showFollowers() {
    this._followers.show()
  }

  hideFollowers() {
    this._followers.hide()
  }

  gatherFollowers() {
    this._followers.gather()
  }

  areFollowersGathering() {
    return this._followers.areGathering()
  }

  areFollowersGathered() {
    return this._followers.areGathered()
  }
}

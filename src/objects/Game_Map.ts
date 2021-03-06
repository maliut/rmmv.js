import {global} from '../managers/DataManager'
import {ImageManager} from '../managers/ImageManager'
import {Graphics} from '../core/Graphics'
import {AudioManager} from '../managers/AudioManager'
import {Game_CommonEvent} from './Game_CommonEvent'
import {Game_Event} from './Game_Event'
import {VehicleType} from '../types/index'
import {Game_Interpreter} from './Game_Interpreter'
import {Game_Vehicle} from './Game_Vehicle'

// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.
export class Game_Map {

  private _interpreter = new Game_Interpreter()
  private _mapId = 0
  private _tilesetId = 0
  private _events: Game_Event[] = []
  private _commonEvents: Game_CommonEvent[] = []
  private readonly _vehicles: Game_Vehicle[] = []
  private _displayX = 0
  private _displayY = 0
  private _nameDisplay = true
  private _scrollDirection = 2
  private _scrollRest = 0
  private _scrollSpeed = 4
  private _parallaxName = ''
  private _parallaxZero = false
  private _parallaxLoopX = false
  private _parallaxLoopY = false
  private _parallaxSx = 0
  private _parallaxSy = 0
  private _parallaxX = 0
  private _parallaxY = 0
  private _battleback1Name = ''
  private _battleback2Name = ''
  private _needsRefresh = false
  tileEvents: Game_Event[] = []

  constructor() {
    this._vehicles[0] = new Game_Vehicle('boat')
    this._vehicles[1] = new Game_Vehicle('ship')
    this._vehicles[2] = new Game_Vehicle('airship')
  }

  setup(mapId) {
    if (!global.$dataMap) {
      throw new Error('The map data is not available')
    }
    this._mapId = mapId
    this._tilesetId = global.$dataMap.tilesetId
    this._displayX = 0
    this._displayY = 0
    this.refereshVehicles()
    this.setupEvents()
    this.setupScroll()
    this.setupParallax()
    this.setupBattleback()
    this._needsRefresh = false
  }

  isEventRunning() {
    return this._interpreter.isRunning() || this.isAnyEventStarting()
  }

  tileWidth() {
    return 48
  }

  tileHeight() {
    return 48
  }

  mapId() {
    return this._mapId
  }

  tilesetId() {
    return this._tilesetId
  }

  displayX() {
    return this._displayX
  }

  displayY() {
    return this._displayY
  }

  parallaxName() {
    return this._parallaxName
  }

  battleback1Name() {
    return this._battleback1Name
  }

  battleback2Name() {
    return this._battleback2Name
  }

  requestRefresh() {
    this._needsRefresh = true
  }

  isNameDisplayEnabled() {
    return this._nameDisplay
  }

  disableNameDisplay() {
    this._nameDisplay = false
  }

  enableNameDisplay() {
    this._nameDisplay = true
  }

  refereshVehicles() {
    this._vehicles.forEach((vehicle) => {
      vehicle.refresh()
    })
  }

  vehicles() {
    return this._vehicles
  }

  vehicle(type: VehicleType | number) {
    if (type === 0 || type === 'boat') {
      return this.boat()
    } else if (type === 1 || type === 'ship') {
      return this.ship()
    } else if (type === 2 || type === 'airship') {
      return this.airship()
    } else {
      return null
    }
  }

  boat() {
    return this._vehicles[0]
  }

  ship() {
    return this._vehicles[1]
  }

  airship() {
    return this._vehicles[2]
  }

  setupEvents() {
    this._events = []
    for (let i = 0; i < global.$dataMap.events.length; i++) {
      if (global.$dataMap.events[i]) {
        this._events[i] = new Game_Event(this._mapId, i)
      }
    }
    this._commonEvents = this.parallelCommonEvents().map((commonEvent) => new Game_CommonEvent(commonEvent.id))
    this.refreshTileEvents()
  }

  events() {
    return this._events.filter((event) => !!event)
  }

  event(eventId: number) {
    return this._events[eventId]
  }

  eraseEvent(eventId: number) {
    this._events[eventId].erase()
  }

  parallelCommonEvents() {
    return global.$dataCommonEvents.filter((commonEvent) => commonEvent?.trigger === 2)
  }

  setupScroll() {
    this._scrollDirection = 2
    this._scrollRest = 0
    this._scrollSpeed = 4
  }

  setupParallax() {
    this._parallaxName = global.$dataMap.parallaxName || ''
    this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName)
    this._parallaxLoopX = global.$dataMap.parallaxLoopX
    this._parallaxLoopY = global.$dataMap.parallaxLoopY
    this._parallaxSx = global.$dataMap.parallaxSx
    this._parallaxSy = global.$dataMap.parallaxSy
    this._parallaxX = 0
    this._parallaxY = 0
  }

  setupBattleback() {
    if (global.$dataMap.specifyBattleback) {
      this._battleback1Name = global.$dataMap.battleback1Name
      this._battleback2Name = global.$dataMap.battleback2Name
    } else {
      this._battleback1Name = ''
      this._battleback2Name = ''
    }
  }

  setDisplayPos(x: number, y: number) {
    if (this.isLoopHorizontal()) {
      this._displayX = x.mod(this.width())
      this._parallaxX = x
    } else {
      const endX = this.width() - this.screenTileX()
      this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX)
      this._parallaxX = this._displayX
    }
    if (this.isLoopVertical()) {
      this._displayY = y.mod(this.height())
      this._parallaxY = y
    } else {
      const endY = this.height() - this.screenTileY()
      this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY)
      this._parallaxY = this._displayY
    }
  }

  parallaxOx() {
    if (this._parallaxZero) {
      return this._parallaxX * this.tileWidth()
    } else if (this._parallaxLoopX) {
      return this._parallaxX * this.tileWidth() / 2
    } else {
      return 0
    }
  }

  parallaxOy() {
    if (this._parallaxZero) {
      return this._parallaxY * this.tileHeight()
    } else if (this._parallaxLoopY) {
      return this._parallaxY * this.tileHeight() / 2
    } else {
      return 0
    }
  }

  tileset() {
    return global.$dataTilesets[this._tilesetId]
  }

  tilesetFlags() {
    const tileset = this.tileset()
    if (tileset) {
      return tileset.flags
    } else {
      return []
    }
  }

  displayName() {
    return global.$dataMap.displayName
  }

  width() {
    return global.$dataMap.width
  }

  height() {
    return global.$dataMap.height
  }

  data() {
    return global.$dataMap.data
  }

  isLoopHorizontal() {
    return global.$dataMap.scrollType === 2 || global.$dataMap.scrollType === 3
  }

  isLoopVertical() {
    return global.$dataMap.scrollType === 1 || global.$dataMap.scrollType === 3
  }

  isDashDisabled() {
    return global.$dataMap.disableDashing
  }

  encounterList() {
    return global.$dataMap.encounterList
  }

  encounterStep() {
    return global.$dataMap.encounterStep
  }

  isOverworld() {
    return this.tileset() && this.tileset().mode === 0
  }

  screenTileX() {
    return Graphics.width / this.tileWidth()
  }

  screenTileY() {
    return Graphics.height / this.tileHeight()
  }

  adjustX(x: number) {
    if (this.isLoopHorizontal() && x < this._displayX -
      (this.width() - this.screenTileX()) / 2) {
      return x - this._displayX + global.$dataMap.width
    } else {
      return x - this._displayX
    }
  }

  adjustY(y: number) {
    if (this.isLoopVertical() && y < this._displayY -
      (this.height() - this.screenTileY()) / 2) {
      return y - this._displayY + global.$dataMap.height
    } else {
      return y - this._displayY
    }
  }

  roundX(x: number) {
    return this.isLoopHorizontal() ? x.mod(this.width()) : x
  }

  roundY(y: number) {
    return this.isLoopVertical() ? y.mod(this.height()) : y
  }

  xWithDirection(x: number, d: number) {
    return x + (d === 6 ? 1 : d === 4 ? -1 : 0)
  }

  yWithDirection(y: number, d: number) {
    return y + (d === 2 ? 1 : d === 8 ? -1 : 0)
  }

  roundXWithDirection(x: number, d: number) {
    return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0))
  }

  roundYWithDirection(y: number, d: number) {
    return this.roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0))
  }

  deltaX(x1: number, x2: number) {
    let result = x1 - x2
    if (this.isLoopHorizontal() && Math.abs(result) > this.width() / 2) {
      if (result < 0) {
        result += this.width()
      } else {
        result -= this.width()
      }
    }
    return result
  }

  deltaY(y1: number, y2: number) {
    let result = y1 - y2
    if (this.isLoopVertical() && Math.abs(result) > this.height() / 2) {
      if (result < 0) {
        result += this.height()
      } else {
        result -= this.height()
      }
    }
    return result
  }

  distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(this.deltaX(x1, x2)) + Math.abs(this.deltaY(y1, y2))
  }

  canvasToMapX(x: number) {
    const tileWidth = this.tileWidth()
    const originX = this._displayX * tileWidth
    const mapX = Math.floor((originX + x) / tileWidth)
    return this.roundX(mapX)
  }

  canvasToMapY(y: number) {
    const tileHeight = this.tileHeight()
    const originY = this._displayY * tileHeight
    const mapY = Math.floor((originY + y) / tileHeight)
    return this.roundY(mapY)
  }

  autoplay() {
    if (global.$dataMap.autoplayBgm) {
      if (global.$gamePlayer.isInVehicle()) {
        global.$gameSystem.saveWalkingBgm2()
      } else {
        AudioManager.playBgm(global.$dataMap.bgm)
      }
    }
    if (global.$dataMap.autoplayBgs) {
      AudioManager.playBgs(global.$dataMap.bgs)
    }
  }

  refreshIfNeeded() {
    if (this._needsRefresh) {
      this.refresh()
    }
  }

  refresh() {
    this.events().forEach(function (event) {
      event.refresh()
    })
    this._commonEvents.forEach(function (event) {
      event.refresh()
    })
    this.refreshTileEvents()
    this._needsRefresh = false
  }

  refreshTileEvents() {
    this.tileEvents = this.events().filter(function (event) {
      return event.isTile()
    })
  }

  eventsXy(x: number, y: number) {
    return this.events().filter((event) => event.pos(x, y))
  }

  eventsXyNt(x: number, y: number) {
    return this.events().filter((event) => event.posNt(x, y))
  }

  tileEventsXy(x: number, y: number) {
    return this.tileEvents.filter((event) => event.posNt(x, y))
  }

  eventIdXy(x: number, y: number) {
    const list = this.eventsXy(x, y)
    return list.length === 0 ? 0 : list[0].eventId()
  }

  scrollDown(distance: number) {
    if (this.isLoopVertical()) {
      this._displayY += distance
      this._displayY %= global.$dataMap.height
      if (this._parallaxLoopY) {
        this._parallaxY += distance
      }
    } else if (this.height() >= this.screenTileY()) {
      const lastY = this._displayY
      this._displayY = Math.min(this._displayY + distance,
        this.height() - this.screenTileY())
      this._parallaxY += this._displayY - lastY
    }
  }

  scrollLeft(distance: number) {
    if (this.isLoopHorizontal()) {
      this._displayX += global.$dataMap.width - distance
      this._displayX %= global.$dataMap.width
      if (this._parallaxLoopX) {
        this._parallaxX -= distance
      }
    } else if (this.width() >= this.screenTileX()) {
      const lastX = this._displayX
      this._displayX = Math.max(this._displayX - distance, 0)
      this._parallaxX += this._displayX - lastX
    }
  }

  scrollRight(distance: number) {
    if (this.isLoopHorizontal()) {
      this._displayX += distance
      this._displayX %= global.$dataMap.width
      if (this._parallaxLoopX) {
        this._parallaxX += distance
      }
    } else if (this.width() >= this.screenTileX()) {
      const lastX = this._displayX
      this._displayX = Math.min(this._displayX + distance,
        this.width() - this.screenTileX())
      this._parallaxX += this._displayX - lastX
    }
  }

  scrollUp(distance: number) {
    if (this.isLoopVertical()) {
      this._displayY += global.$dataMap.height - distance
      this._displayY %= global.$dataMap.height
      if (this._parallaxLoopY) {
        this._parallaxY -= distance
      }
    } else if (this.height() >= this.screenTileY()) {
      const lastY = this._displayY
      this._displayY = Math.max(this._displayY - distance, 0)
      this._parallaxY += this._displayY - lastY
    }
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width() && y >= 0 && y < this.height()
  }

  checkPassage(x: number, y: number, bit: number) {
    const flags = this.tilesetFlags()
    const tiles = this.allTiles(x, y)
    for (let i = 0; i < tiles.length; i++) {
      const flag = flags[tiles[i]]
      if ((flag & 0x10) !== 0)  // [*] No effect on passage
        continue
      if ((flag & bit) === 0)   // [o] Passable
        return true
      if ((flag & bit) === bit) // [x] Impassable
        return false
    }
    return false
  }

  tileId(x: number, y: number, z: number) {
    const width = global.$dataMap.width
    const height = global.$dataMap.height
    return global.$dataMap.data[(z * height + y) * width + x] || 0
  }

  layeredTiles(x: number, y: number) {
    const tiles: number[] = []
    for (let i = 0; i < 4; i++) {
      tiles.push(this.tileId(x, y, 3 - i))
    }
    return tiles
  }

  allTiles(x: number, y: number) {
    const tiles = this.tileEventsXy(x, y).map(function (event) {
      return event.tileId()
    })
    return tiles.concat(this.layeredTiles(x, y))
  }

  autotileType(x: number, y: number, z: number) {
    const tileId = this.tileId(x, y, z)
    return tileId >= 2048 ? Math.floor((tileId - 2048) / 48) : -1
  }

  isPassable(x: number, y: number, d: number) {
    return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f)
  }

  isBoatPassable(x: number, y: number) {
    return this.checkPassage(x, y, 0x0200)
  }

  isShipPassable(x: number, y: number) {
    return this.checkPassage(x, y, 0x0400)
  }

  isAirshipLandOk(x: number, y: number) {
    return this.checkPassage(x, y, 0x0800) && this.checkPassage(x, y, 0x0f)
  }

  checkLayeredTilesFlags(x: number, y: number, bit: number) {
    const flags = this.tilesetFlags()
    return this.layeredTiles(x, y).some(function (tileId) {
      return (flags[tileId] & bit) !== 0
    })
  }

  isLadder(x: number, y: number) {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x20)
  }

  isBush(x: number, y: number) {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x40)
  }

  isCounter(x: number, y: number) {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x80)
  }

  isDamageFloor(x: number, y: number) {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x100)
  }

  terrainTag(x: number, y: number) {
    if (this.isValid(x, y)) {
      const flags = this.tilesetFlags()
      const tiles = this.layeredTiles(x, y)
      for (let i = 0; i < tiles.length; i++) {
        const tag = flags[tiles[i]] >> 12
        if (tag > 0) {
          return tag
        }
      }
    }
    return 0
  }

  regionId(x: number, y: number) {
    return this.isValid(x, y) ? this.tileId(x, y, 5) : 0
  }

  startScroll(direction: number, distance: number, speed: number) {
    this._scrollDirection = direction
    this._scrollRest = distance
    this._scrollSpeed = speed
  }

  isScrolling() {
    return this._scrollRest > 0
  }

  update(sceneActive: boolean) {
    this.refreshIfNeeded()
    if (sceneActive) {
      this.updateInterpreter()
    }
    this.updateScroll()
    this.updateEvents()
    this.updateVehicles()
    this.updateParallax()
  }

  updateScroll() {
    if (this.isScrolling()) {
      const lastX = this._displayX
      const lastY = this._displayY
      this.doScroll(this._scrollDirection, this.scrollDistance())
      if (this._displayX === lastX && this._displayY === lastY) {
        this._scrollRest = 0
      } else {
        this._scrollRest -= this.scrollDistance()
      }
    }
  }

  scrollDistance() {
    return Math.pow(2, this._scrollSpeed) / 256
  }

  doScroll(direction: number, distance: number) {
    switch (direction) {
    case 2:
      this.scrollDown(distance)
      break
    case 4:
      this.scrollLeft(distance)
      break
    case 6:
      this.scrollRight(distance)
      break
    case 8:
      this.scrollUp(distance)
      break
    }
  }

  updateEvents() {
    this.events().forEach((event) => {
      event.update()
    })
    this._commonEvents.forEach((event) => {
      event.update()
    })
  }

  updateVehicles() {
    this._vehicles.forEach((vehicle) => {
      vehicle.update()
    })
  }

  updateParallax() {
    if (this._parallaxLoopX) {
      this._parallaxX += this._parallaxSx / this.tileWidth() / 2
    }
    if (this._parallaxLoopY) {
      this._parallaxY += this._parallaxSy / this.tileHeight() / 2
    }
  }

  changeTileset(tilesetId: number) {
    this._tilesetId = tilesetId
    this.refresh()
  }

  changeBattleback(battleback1Name: string, battleback2Name: string) {
    this._battleback1Name = battleback1Name
    this._battleback2Name = battleback2Name
  }

  changeParallax(name: string, loopX: boolean, loopY: boolean, sx: number, sy: number) {
    this._parallaxName = name
    this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName)
    if (this._parallaxLoopX && !loopX) {
      this._parallaxX = 0
    }
    if (this._parallaxLoopY && !loopY) {
      this._parallaxY = 0
    }
    this._parallaxLoopX = loopX
    this._parallaxLoopY = loopY
    this._parallaxSx = sx
    this._parallaxSy = sy
  }

  updateInterpreter() {
    for (; ;) {
      this._interpreter.update()
      if (this._interpreter.isRunning()) {
        return
      }
      if (this._interpreter.eventId() > 0) {
        this.unlockEvent(this._interpreter.eventId())
        this._interpreter.clear()
      }
      if (!this.setupStartingEvent()) {
        return
      }
    }
  }

  unlockEvent(eventId: number) {
    if (this._events[eventId]) {
      this._events[eventId].unlock()
    }
  }

  setupStartingEvent() {
    this.refreshIfNeeded()
    if (this._interpreter.setupReservedCommonEvent()) {
      return true
    }
    if (this.setupTestEvent()) {
      return true
    }
    if (this.setupStartingMapEvent()) {
      return true
    }
    if (this.setupAutorunCommonEvent()) {
      return true
    }
    return false
  }

  setupTestEvent() {
    if (global.$testEvent) {
      this._interpreter.setup(global.$testEvent, 0)
      global.$testEvent = null
      return true
    }
    return false
  }

  setupStartingMapEvent() {
    const events = this.events()
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      if (event.isStarting()) {
        event.clearStartingFlag()
        this._interpreter.setup(event.list(), event.eventId())
        return true
      }
    }
    return false
  }

  setupAutorunCommonEvent() {
    for (let i = 0; i < global.$dataCommonEvents.length; i++) {
      const event = global.$dataCommonEvents[i]
      if (event && event.trigger === 1 && global.$gameSwitches.value(event.switchId)) {
        this._interpreter.setup(event.list)
        return true
      }
    }
    return false
  }

  isAnyEventStarting() {
    return this.events().some((event) => event.isStarting())
  }
}
